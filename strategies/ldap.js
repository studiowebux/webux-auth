// TODO - EVERYTHING !
/*
const LdapStrategy = require("passport-ldapauth").Strategy;

// LDAP config
const getLDAPConfiguration = function(req, callback) {
  process.nextTick(function() {
    const opts = {
      passReqToCallback: true,
      server: {
        url: config.authentication.ldap.url,
        bindDn: "uid=" + req.body.username + config.authentication.ldap.bindDN,
        bindCredentials: req.body.password,
        searchBase: config.authentication.ldap.searchBase,
        searchAttributes: config.authentication.ldap.searchAttributes,
        searchFilter: "(uid=" + req.body.username + ")",
        tlsOptions: {
          ca: [fs.readFileSync(config.path + config.authentication.ldap.cacert)]
        }
      }
    };
    // console.log(opts);
    callback(null, opts);
  });
};

passport.use(
  new LdapStrategy(getLDAPConfiguration, function(req, user, done) {
    return done(null, user);
  })
);

module.export = passport;
*/