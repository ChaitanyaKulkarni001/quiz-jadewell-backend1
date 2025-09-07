const fetch = require('node-fetch');

async function testIntegration() {
  console.log('🧪 Testing TCM Quiz Application Integration...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await fetch('http://localhost:5000/health');
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      throw new Error('Server not responding');
    }

    // Test 2: Test practitioners API
    console.log('\n2. Testing practitioners API...');
    const practitionersResponse = await fetch('http://localhost:5000/api/practitioners');
    if (practitionersResponse.ok) {
      const practitioners = await practitionersResponse.json();
      console.log(`✅ Found ${practitioners.length} practitioners`);
      
      // Display practitioner details
      practitioners.forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.name} - ${p.title} (Rating: ${p.rating})`);
      });
    } else {
      throw new Error('Practitioners API failed');
    }

    // Test 3: Test appointment creation API
    console.log('\n3. Testing appointment creation API...');
    const testAppointment = {
      state: 'California',
      age: 30,
      email: 'test@example.com',
      name: 'Test User',
      authMethod: 'email',
      practitioner: {
        id: 1,
        name: 'Dr. Sarah Chen'
      },
      selectedDate: new Date().toISOString().split('T')[0],
      selectedTime: '10:00',
      paymentStatus: 'completed',
      paymentId: 'test_payment_123',
      amount: 150
    };

    const appointmentResponse = await fetch('http://localhost:5000/api/appointment/create-full', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAppointment)
    });

    if (appointmentResponse.ok) {
      const appointmentResult = await appointmentResponse.json();
      console.log(`✅ Appointment created successfully (ID: ${appointmentResult.appointmentId})`);
    } else {
      const error = await appointmentResponse.text();
      throw new Error(`Appointment creation failed: ${error}`);
    }

    // Test 4: Test appointment retrieval
    console.log('\n4. Testing appointment retrieval...');
    const appointmentsResponse = await fetch('http://localhost:5000/api/appointment/all');
    if (appointmentsResponse.ok) {
      const appointments = await appointmentsResponse.json();
      console.log(`✅ Found ${appointments.length} appointments in database`);
    } else {
      throw new Error('Appointment retrieval failed');
    }

    console.log('\n🎉 All tests passed! Integration is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   - Server is running on port 5000');
    console.log('   - Database is properly seeded with practitioners');
    console.log('   - API endpoints are functional');
    console.log('   - Appointment flow is working');
    console.log('\n🚀 Ready for frontend testing!');

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Make sure server is running: node server.js');
    console.log('   2. Reset database: node db_manager.js reset');
    console.log('   3. Check server logs for errors');
    process.exit(1);
  }
}

// Run the test
testIntegration();
