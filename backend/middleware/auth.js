import { supabase } from '../config/supabase.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Developer bypass for admin credentials
      if (token === 'mock-admin-token') {
        if (!global.isDbConnected) {
          // Sandbox Mode fallback
          req.user = {
            id: 'admin1',
            _id: 'admin1',
            email: 'admin@vyvora.com',
            name: 'Admin Manager',
            role: 'admin',
            country: 'India',
            shippingAddresses: [],
            wishlist: [],
            walletBalance: 500,
            loyaltyPoints: 100,
            referralCode: 'REF-ADMIN',
            isBanned: false
          };
          return next();
        }

        const { data: userProfile } = await supabase.from('profiles').select('*').eq('email', 'admin@vyvora.com').maybeSingle();
        let user = userProfile;
        if (!user) {
          const { data: newProfile } = await supabase.from('profiles').insert({
            id: '00000000-0000-0000-0000-000000000000',
            email: 'admin@vyvora.com',
            name: 'Admin Manager',
            role: 'admin',
            country: 'India',
            referral_code: 'REF-ADMIN'
          }).select().single();
          user = newProfile;
        }
        
        req.user = {
          ...user,
          _id: user.id,
          supabaseId: user.id,
          shippingAddresses: user.shipping_addresses || [],
          walletBalance: Number(user.wallet_balance) || 0,
          loyaltyPoints: user.loyalty_points || 0,
          referralCode: user.referral_code,
          referredBy: user.referred_by,
          isBanned: user.is_banned
        };
        return next();
      }
      
      // Get user from Supabase using user's access token (JWT)
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        return res.status(401).json({ message: 'Not authorized, token validation failed or expired' });
      }

      if (!global.isDbConnected) {
        // Sandbox Mode fallback
        const { memoryUsers } = await import('../config/memoryStore.js');
        let user = memoryUsers.find(u => u.supabaseId === supabaseUser.id || u.email === supabaseUser.email);
        if (!user) {
          user = {
            _id: supabaseUser.id,
            supabaseId: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || 'Customer',
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
        req.user = user;
        return next();
      }

      // Find user in Supabase profiles
      const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', supabaseUser.id).maybeSingle();
      let user = userProfile;

      // If user exists in Supabase but not in profiles, perform auto-sync
      if (!user) {
        const { data: newProfile } = await supabase.from('profiles').insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || 'Customer',
          role: supabaseUser.user_metadata?.role || 'user',
          country: supabaseUser.user_metadata?.country || 'India',
          referral_code: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase()
        }).select().maybeSingle();
        user = newProfile;
      }

      // Demote Google OAuth logins from admin back to user (Google is customer-only)
      if (user && supabaseUser.app_metadata?.provider === 'google' && user.role === 'admin') {
        const { data: demotedProfile } = await supabase
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', user.id)
          .select()
          .maybeSingle();
        if (demotedProfile) {
          user = demotedProfile;
        } else {
          user.role = 'user';
        }
      }

      if (user.is_banned) {
        return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
      }

      // Attach user to req object mapped to Mongoose format
      req.user = {
        ...user,
        _id: user.id,
        supabaseId: user.id,
        shippingAddresses: user.shipping_addresses || [],
        walletBalance: Number(user.wallet_balance) || 0,
        loyaltyPoints: user.loyalty_points || 0,
        referralCode: user.referral_code,
        referredBy: user.referred_by,
        isBanned: user.is_banned
      };
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Role based middlewares
export const admin = (req, res, next) => {
  const allowedRoles = ['admin', 'super-admin', 'super_admin', 'manager'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized, admin or manager access required' });
  }
};

export const superAdmin = (req, res, next) => {
  const allowedRoles = ['super-admin', 'super_admin'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized, super-admin access required' });
  }
};

export const manager = (req, res, next) => {
  const allowedRoles = ['manager', 'admin', 'super-admin', 'super_admin'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized, manager access required' });
  }
};

export const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      if (token === 'mock-admin-token') {
        if (!global.isDbConnected) {
          req.user = {
            id: 'admin1',
            _id: 'admin1',
            email: 'admin@vyvora.com',
            name: 'Admin Manager',
            role: 'admin',
            country: 'India',
            shippingAddresses: [],
            wishlist: [],
            walletBalance: 500,
            loyaltyPoints: 100,
            referralCode: 'REF-ADMIN',
            isBanned: false
          };
          return next();
        }
        const { data: user } = await supabase.from('profiles').select('*').eq('email', 'admin@vyvora.com').maybeSingle();
        if (user && !user.is_banned) {
          req.user = {
            ...user,
            _id: user.id,
            supabaseId: user.id,
            shippingAddresses: user.shipping_addresses || [],
            walletBalance: Number(user.wallet_balance) || 0,
            loyaltyPoints: user.loyalty_points || 0,
            referralCode: user.referral_code,
            referredBy: user.referred_by,
            isBanned: user.is_banned
          };
        }
        return next();
      }
      
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
      
      if (!error && supabaseUser) {
        if (!global.isDbConnected) {
          const { memoryUsers } = await import('../config/memoryStore.js');
          const user = memoryUsers.find(u => u.supabaseId === supabaseUser.id || u.email === supabaseUser.email);
          if (user && !user.isBanned) {
            req.user = user;
          }
        } else {
          const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', supabaseUser.id).maybeSingle();
          let user = userProfile;
          if (user && !user.is_banned) {
            if (supabaseUser.app_metadata?.provider === 'google' && user.role === 'admin') {
              user.role = 'user';
            }
            req.user = {
              ...user,
              _id: user.id,
              supabaseId: user.id,
              shippingAddresses: user.shipping_addresses || [],
              walletBalance: Number(user.wallet_balance) || 0,
              loyaltyPoints: user.loyalty_points || 0,
              referralCode: user.referral_code,
              referredBy: user.referred_by,
              isBanned: user.is_banned
            };
          }
        }
      }
    } catch (error) {
      console.warn('Optional protect check failed:', error.message);
    }
  }
  next();
};
