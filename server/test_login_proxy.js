import http from 'http';

const loginData = JSON.stringify({
  email: 'student01@gmail.com',
  password: '123456'
});

const reqLogin = http.request({
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Login Status:', res.statusCode);
    const data = JSON.parse(body);
    if(data.token) {
        console.log("Token received, checking /me...");
        const reqMe = http.request({
            hostname: '127.0.0.1',
            port: 5000,
            path: '/api/auth/me',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.token}`
            }
        }, (resMe) => {
            let bodyMe = '';
            resMe.on('data', chunk => bodyMe += chunk);
            resMe.on('end', () => {
                console.log('Me Status:', resMe.statusCode);
                console.log('User role:', JSON.parse(bodyMe).role);
            });
        });
        reqMe.end();
    } else {
        console.log("No token in response:", data);
    }
  });
});

reqLogin.on('error', error => {
  console.error('Error:', error.message);
});

reqLogin.write(loginData);
reqLogin.end();
