import http from 'http';

const registerData = JSON.stringify({
  name: 'Test Student',
  email: 'test_student_555@gmail.com',
  password: 'password123',
  passwordConfirm: 'password123',
  role: 'student',
  college: 'Test College',
  year: 1,
  section: 'A'
});

const reqRegister = http.request({
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Register Response:', res.statusCode, data);

    const loginData = JSON.stringify({
      email: 'test_student_555@gmail.com',
      password: 'password123'
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
    }, (resLogin) => {
      let dataLogin = '';
      resLogin.on('data', chunk => dataLogin += chunk);
      resLogin.on('end', () => {
        console.log('Login Response:', resLogin.statusCode, dataLogin);
      });
    });
    reqLogin.write(loginData);
    reqLogin.end();
  });
});

reqRegister.on('error', error => {
  console.error('Error:', error);
});

reqRegister.write(registerData);
reqRegister.end();
