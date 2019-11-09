# Webux Auth

This module is a wrapper around the Passport JS module along with redis integration.

Redis is use to invalidate the access/refresh tokens.

## Installation

```bash
npm i --save @studiowebux/auth
```

## Usage

### The configuration

```javascript
module.exports = {
  local: {
    username: "email",
    password: "password",
    passwordStrategy: {
      enabled: false,
      regex: "",
      message: "The password strategy is enabled and you must be compliant."
    },
    autoLogonOnRegister: true,
    autoActivate: false
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "SHUUUT!",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "SHUUUUT!",
    accessLife: 30, // 900
    refreshLife: 86400,
    scheme: "Bearer",
    id: "id",
    serializeUser: ["id", "fullname"]
  },
  redis: {
    mock: true,
    host: "127.0.0.1",
    port: "6379",
    password: "",
    no_ready_check: true
  }
};
```

The **local** object is use to initialize the local strategy (local login and register function)  
The **jwt** object is use to configure the JWT token, it applies for access and refresh tokens configuration.  
the **redis** object configure the access to the redis server instance.

The _autoLogonOnRegister_ allows you to log in the user automatically after a register process. Keep in mind to activate the account to get the full access.  
The _autoActivate_ allows to skip the email/SMS verification to validate the user account.

By default, some environment variables are present, you should use more if you need it.

## Example

I recommend you to check the examples/ folder for a detailed example to use this module.

### Specification

errorHandler function, to handle the error correctly I use the function present here : **examples/helpers/errorHandler.js**

The module is more like a template and I tried to allow you to add the specific part/strategies for your application.

## Passport JS Strategies

Currently there is only 2 implemented

- JWT
- Local Sign in / Sign up | (login/register)

you can ask/PR new ones.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

SEE LICENSE IN license.txt
