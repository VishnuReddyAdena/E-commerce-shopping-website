import { supabase } from '../config/supabase.js';
import { realtimeService } from '../services/supabase.service.js';

// Map Postgres profile row to frontend expected format
const mapProfileToUser = (profile) => {
  if (!profile) return null;
  return {
    _id: profile.id,
    id: profile.id,
    supabaseId: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    country: profile.country,
    avatarUrl: profile.avatar_url,
    shippingAddresses: profile.shipping_addresses || [],
    wishlist: profile.wishlist || [],
    walletBalance: Number(profile.wallet_balance) || 0,
    loyaltyPoints: profile.loyalty_points || 0,
    referralCode: profile.referral_code,
    referredBy: profile.referred_by,
    isBanned: profile.is_banned,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  };
};

const formatUserResponse = (profile, sessionToken) => {
  const mapped = mapProfileToUser(profile);
  if (sessionToken) {
    mapped.token = sessionToken;
  }
  return mapped;
};

// @desc    Register a new user (with Supabase Auth & Postgres Profiles)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, referralCodeApplied, country } = req.body;

  try {
    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'user',
          country: country || 'India'
        }
      }
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    const supabaseUser = authData.user;
    if (!supabaseUser) {
      return res.status(400).json({ message: 'Registration failed, no user returned from auth' });
    }

    let userObj = null;

    if (!global.isDbConnected) {
      // Sandbox Mode fallback
      const { memoryUsers } = await import('../config/memoryStore.js');
      let referrer = memoryUsers.find(u => u.referralCode === referralCodeApplied?.toUpperCase());
      if (referrer) {
        referrer.walletBalance += 50;
        referrer.loyaltyPoints += 20;
      }
      userObj = {
        _id: supabaseUser.id,
        supabaseId: supabaseUser.id,
        name,
        email,
        role: role || 'user',
        country: country || 'India',
        shippingAddresses: [],
        wishlist: [],
        walletBalance: referrer ? 150 : 100,
        loyaltyPoints: 10,
        referralCode: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        referredBy: referrer ? referrer._id : null,
        isBanned: false
      };
      memoryUsers.push(userObj);
    } else {
      // 2. Lookup referrer in Supabase
      let referrerId = null;
      if (referralCodeApplied) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('*')
          .eq('referral_code', referralCodeApplied.toUpperCase())
          .maybeSingle();

        if (referrer) {
          referrerId = referrer.id;
          await supabase
            .from('profiles')
            .update({
              wallet_balance: Number(referrer.wallet_balance) + 50,
              loyalty_points: referrer.loyalty_points + 20
            })
            .eq('id', referrer.id);
        }
      }

      // 3. Upsert user profile to prevent race conditions with the trigger
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: supabaseUser.id,
          name,
          email,
          role: role || 'user',
          country: country || 'India',
          referral_code: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          referred_by: referrerId,
          wallet_balance: referrerId ? 150 : 100
        }, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        return res.status(400).json({ message: profileError.message });
      }
      userObj = profile;
    }

    // 4. Broadcast new customer event
    await realtimeService.broadcastEvent('e-commerce-notifications', 'newCustomer', {
      name: userObj.name,
      email: userObj.email
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification.',
      user: !global.isDbConnected ? userObj : formatUserResponse(userObj, authData.session?.access_token || null)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Login via Supabase & fetch Profile)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Sign in user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ message: authError.message || 'Invalid email or password' });
    }

    const supabaseUser = authData.user;
    let userObj = null;

    if (!global.isDbConnected) {
      // Sandbox Mode fallback
      const { memoryUsers } = await import('../config/memoryStore.js');
      let user = memoryUsers.find(u => u.supabaseId === supabaseUser.id || u.email === supabaseUser.email);
      if (!user) {
        user = {
          _id: supabaseUser.id,
          supabaseId: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || 'Customer',
          email: supabaseUser.email,
          role: supabaseUser.user_metadata?.role || 'user',
          country: supabaseUser.user_metadata?.country || 'India',
          shippingAddresses: [],
          wishlist: [],
          walletBalance: 100,
          loyaltyPoints: 10,
          referralCode: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          isBanned: false
        };
        memoryUsers.push(user);
      }
      userObj = user;
    } else {
      // 2. Retrieve corresponding Postgres user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      let user = profile;

      // Sync check (self-healing if profile doesn't exist yet)
      if (!user) {
        const { data: byEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', supabaseUser.email)
          .maybeSingle();

        if (byEmail) {
          const { data: updated } = await supabase
            .from('profiles')
            .update({ id: supabaseUser.id })
            .eq('id', byEmail.id)
            .select()
            .single();
          user = updated;
        } else {
          const { data: created } = await supabase
            .from('profiles')
            .insert({
              id: supabaseUser.id,
              name: supabaseUser.user_metadata?.name || 'Customer',
              email: supabaseUser.email,
              role: supabaseUser.user_metadata?.role || 'user',
              country: supabaseUser.user_metadata?.country || 'India',
              referral_code: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase()
            })
            .select()
            .single();
          user = created;
        }
      }

      // Admin Override Check
      const emailLower = user.email?.toLowerCase() || '';
      if (emailLower && (emailLower.includes('admin') || emailLower === 'vishnubhai123@gmail.com') && user.role !== 'admin') {
        const { data: updated } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id)
          .select()
          .single();
        user = updated;
      }

      if (user.is_banned) {
        return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
      }

      userObj = user;
    }

    res.json(!global.isDbConnected ? userObj : formatUserResponse(userObj, authData.session.access_token));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Synchronize Supabase Session with Database (For Social Logins)
// @route   POST /api/auth/sync
// @access  Public
export const syncUser = async (req, res) => {
  const { supabaseId, email, name, role, country, referralCodeApplied } = req.body;

  try {
    let userObj = null;

    if (!global.isDbConnected) {
      // Sandbox Mode fallback
      const { memoryUsers } = await import('../config/memoryStore.js');
      let user = memoryUsers.find(u => u.supabaseId === supabaseId || u.email === email);
      if (!user) {
        let referrer = memoryUsers.find(u => u.referralCode === referralCodeApplied?.toUpperCase());
        if (referrer) {
          referrer.walletBalance += 50;
          referrer.loyaltyPoints += 20;
        }
        user = {
          _id: supabaseId,
          supabaseId: supabaseId,
          name: name || 'Customer',
          email: email,
          role: role || 'user',
          country: country || 'India',
          shippingAddresses: [],
          wishlist: [],
          walletBalance: referrer ? 150 : 100,
          loyaltyPoints: 10,
          referralCode: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          isBanned: false
        };
        memoryUsers.push(user);
      }
      userObj = user;
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseId)
        .maybeSingle();

      let user = profile;

      if (user) {
        // Auto-promote if matches keyword
        if (email && (email.toLowerCase().includes('admin') || email.toLowerCase() === 'vishnubhai123@gmail.com') && user.role !== 'admin') {
          const { data: updated } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id)
            .select()
            .single();
          user = updated;
        }
      } else {
        // Try to find by email to link
        const { data: byEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (byEmail) {
          const { data: updated } = await supabase
            .from('profiles')
            .update({ id: supabaseId })
            .eq('id', byEmail.id)
            .select()
            .single();
          user = updated;
        } else {
          // Create new synced profile
          let referrerId = null;
          if (referralCodeApplied) {
            const { data: referrer } = await supabase
              .from('profiles')
              .select('*')
              .eq('referral_code', referralCodeApplied.toUpperCase())
              .maybeSingle();

            if (referrer) {
              referrerId = referrer.id;
              await supabase
                .from('profiles')
                .update({
                  wallet_balance: Number(referrer.wallet_balance) + 50,
                  loyalty_points: referrer.loyalty_points + 20
                })
                .eq('id', referrer.id);
            }
          }

          let userRole = role || 'user';
          if (email && (email.toLowerCase().includes('admin') || email.toLowerCase() === 'vishnubhai123@gmail.com')) {
            userRole = 'admin';
          }

          const { data: created } = await supabase
            .from('profiles')
            .insert({
              id: supabaseId,
              email,
              name: name || 'Customer',
              role: userRole,
              country: country || 'India',
              referral_code: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
              referred_by: referrerId,
              wallet_balance: referrerId ? 150 : 100
            })
            .select()
            .single();
          user = created;

          // Broadcast new customer event
          await realtimeService.broadcastEvent('e-commerce-notifications', 'newCustomer', {
            name: user.name,
            email: user.email
          });
        }
      }
      userObj = user;
    }

    res.status(200).json(!global.isDbConnected ? userObj : formatUserResponse(userObj, null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth Callback placeholder
export const googleAuth = async (req, res) => {
  res.status(501).json({ message: 'Google OAuth is managed directly via Supabase Auth Client.' });
};

// @desc    Verify email placeholder
export const verifyEmail = async (req, res) => {
  res.json({ message: 'Email verification is managed directly by Supabase Auth.' });
};

// @desc    Forgot Password request
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.origin || 'http://localhost:5173'}/reset-password`
    });
    if (error) throw error;
    res.json({ message: 'Password reset link sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password callback
export const resetPassword = async (req, res) => {
  const { password } = req.body;
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    if (!global.isDbConnected) {
      // Sandbox Mode
      const { memoryUsers } = await import('../config/memoryStore.js');
      const user = memoryUsers.find(u => u._id === req.user._id);
      if (user) {
        return res.json(user);
      }
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user._id)
      .single();

    if (profile) {
      let user = profile;
      // Admin Override Check
      const emailLower = user.email?.toLowerCase() || '';
      if (emailLower && (emailLower.includes('admin') || emailLower === 'vishnubhai123@gmail.com') && user.role !== 'admin') {
        const { data: updated } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id)
          .select()
          .single();
        user = updated;
      }
      res.json(mapProfileToUser(user));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const { name, country, avatarUrl } = req.body;
  try {
    if (!global.isDbConnected) {
      // Sandbox Mode
      const { memoryUsers } = await import('../config/memoryStore.js');
      const user = memoryUsers.find(u => u._id === req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.name = name || user.name;
      user.country = country || user.country;
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
      return res.json(user);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user._id)
      .single();

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (country) updateFields.country = country;
    if (avatarUrl !== undefined) updateFields.avatar_url = avatarUrl;

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .update(updateFields)
      .eq('id', req.user._id)
      .select()
      .single();

    // Update metadata in Supabase Auth as well
    const metaUpdates = {};
    if (name) metaUpdates.name = name;
    if (country) metaUpdates.country = country;
    if (avatarUrl) metaUpdates.avatarUrl = avatarUrl;

    await supabase.auth.admin.updateUserById(req.user._id, {
      user_metadata: metaUpdates
    });

    res.json(mapProfileToUser(updatedProfile));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/addresses
// @access  Private
export const addShippingAddress = async (req, res) => {
  const { street, city, state, zip, country, isDefault } = req.body;

  try {
    if (!global.isDbConnected) {
      // Sandbox Mode
      const { memoryUsers } = await import('../config/memoryStore.js');
      const user = memoryUsers.find(u => u._id === req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (isDefault) {
        user.shippingAddresses.forEach(addr => addr.isDefault = false);
      }
      user.shippingAddresses.push({ street, city, state, zip, country, isDefault });
      return res.status(201).json(user.shippingAddresses);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('shipping_addresses')
      .eq('id', req.user._id)
      .single();

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    let addresses = profile.shipping_addresses || [];
    if (isDefault) {
      addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }
    addresses.push({ street, city, state, zip, country, isDefault });

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .update({ shipping_addresses: addresses })
      .eq('id', req.user._id)
      .select('shipping_addresses')
      .single();

    res.status(201).json(updatedProfile.shipping_addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle wishlist product
// @route   POST /api/auth/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!global.isDbConnected) {
      // Sandbox Mode
      const { memoryUsers } = await import('../config/memoryStore.js');
      const user = memoryUsers.find(u => u._id === req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const index = user.wishlist.indexOf(productId);
      if (index > -1) {
        user.wishlist.splice(index, 1);
      } else {
        user.wishlist.push(productId);
      }
      return res.json(user.wishlist);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('wishlist')
      .eq('id', req.user._id)
      .single();

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    let wishlist = profile.wishlist || [];
    const index = wishlist.indexOf(productId);
    if (index > -1) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .update({ wishlist })
      .eq('id', req.user._id)
      .select('wishlist')
      .single();

    res.json(updatedProfile.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    if (!global.isDbConnected) {
      // Sandbox Mode
      const { memoryUsers } = await import('../config/memoryStore.js');
      return res.json(memoryUsers);
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');

    res.json(profiles.map(mapProfileToUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban or unban a user
export const banUser = async (req, res) => {
  try {
    if (!global.isDbConnected) {
      // Sandbox Mode
      const { memoryUsers } = await import('../config/memoryStore.js');
      const user = memoryUsers.find(u => u._id === req.params.id);
      if (user) {
        user.isBanned = !user.isBanned;
        return res.json(user);
      }
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (profile) {
      const isBannedNew = !profile.is_banned;

      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({ is_banned: isBannedNew })
        .eq('id', req.params.id)
        .select()
        .single();

      if (isBannedNew) {
        await supabase.auth.admin.signOut(req.params.id);
      }

      res.json(mapProfileToUser(updatedProfile));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
export const deleteUser = async (req, res) => {
  try {
    if (!global.isDbConnected) {
      // Sandbox Mode
      const { memoryUsers } = await import('../config/memoryStore.js');
      const userIndex = memoryUsers.findIndex(u => u._id === req.params.id);
      if (userIndex > -1) {
        memoryUsers.splice(userIndex, 1);
        return res.json({ message: 'User deleted successfully from sandbox' });
      }
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Delete from Supabase Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(req.params.id);
    if (deleteAuthError) console.error('Failed to delete Supabase Auth user:', deleteAuthError.message);

    // 2. Delete from public profiles table
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', req.params.id);

    if (deleteProfileError) throw deleteProfileError;

    res.json({ message: 'User deleted successfully from database and auth' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (Admin)
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  try {
    if (!global.isDbConnected) {
      // Sandbox Mode
      const { memoryUsers } = await import('../config/memoryStore.js');
      const user = memoryUsers.find(u => u._id === req.params.id);
      if (user) {
        user.role = role || user.role;
        return res.json(user);
      }
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updatedProfile) {
      await supabase.auth.admin.updateUserById(req.params.id, {
        user_metadata: { role }
      });
      res.json(mapProfileToUser(updatedProfile));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
