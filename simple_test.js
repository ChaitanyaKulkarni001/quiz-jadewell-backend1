const fetch = require('node-fetch');

async function simpleTest() {
  console.log('🧪 Simple Integration Test\n');

  try {
    // Test practitioners API
    console.log('Testing practitioners API...');
    const response = await fetch('http://localhost:5000/api/practitioners');
    
    if (response.ok) {
      const practitioners = await response.json();
      console.log(`✅ Found ${practitioners.length} practitioners`);
      console.log('First practitioner:', practitioners[0]?.name);
    } else {
      console.log('❌ Practitioners API failed:', response.status);
    }

    // Test appointment creation
    console.log('\nTesting appointment creation...');
    const appointmentData = {
      state: 'California',
      age: 30,
      email: 'test@example.com',
      name: 'Test User',
      authMethod: 'email',
      practitioner: { id: 1, name: 'Dr. Sarah Chen' },
      selectedDate: '2025-01-15',
      selectedTime: '10:00',
      paymentStatus: 'completed',
      paymentId: 'test_123',
      amount: 150
    };

    const createResponse = await fetch('http://localhost:5000/api/appointment/create-full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log(`✅ Appointment created (ID: ${result.appointmentId})`);
    } else {
      console.log('❌ Appointment creation failed:', createResponse.status);
    }

    console.log('\n🎉 Basic integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest();
