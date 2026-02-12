const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

async function testBackend() {
    try {
        console.log('--- Testing Admin Login ---');
        const adminLogin = await axios.post(`${API_URL}/auth/login`, { username: 'admin', password: 'admin123' });
        const adminToken = adminLogin.data.token;
        console.log('Admin Token received');

        console.log('--- Testing User Login ---');
        const userLogin = await axios.post(`${API_URL}/auth/login`, { username: 'user', password: 'user123' });
        const userToken = userLogin.data.token;
        console.log('User Token received');

        console.log('--- Testing Admin Config ---');
        const adminConfig = await axios.get(`${API_URL}/config/mfe`, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('Admin Config:', adminConfig.data);

        console.log('--- Testing User Config ---');
        const userConfig = await axios.get(`${API_URL}/config/mfe`, { headers: { Authorization: `Bearer ${userToken}` } });
        console.log('User Config:', userConfig.data);

        console.log('--- Testing Admin Data Access (as Admin) ---');
        const adminData = await axios.get(`${API_URL}/admin/data`, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('Admin Data:', adminData.data);

        console.log('--- Testing User Data Access (as User) ---');
        const userData = await axios.get(`${API_URL}/user/data`, { headers: { Authorization: `Bearer ${userToken}` } });
        console.log('User Data:', userData.data);

        console.log('--- Testing RBAC (User accessing Admin Data) ---');
        try {
            await axios.get(`${API_URL}/admin/data`, { headers: { Authorization: `Bearer ${userToken}` } });
        } catch (error) {
            console.log('Correctly blocked:', error.response.status, error.response.data);
        }

        console.log('--- ALL TESTS PASSED ---');

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testBackend();
