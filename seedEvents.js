const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set in environment variables');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Default events to seed
const defaultEvents = [
  {
    title: 'Community Beach Cleanup Drive',
    description: 'Join us for a comprehensive beach cleanup initiative to protect our marine ecosystem. We will collect plastic waste, organize recyclable materials, and raise awareness about ocean pollution. All participants will receive gloves, bags, and refreshments. This event is family-friendly and suitable for all ages.',
    eventType: 'Cleanup',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
    location: 'Cox\'s Bazar Beach, Chittagong',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Tree Plantation Campaign in Dhaka',
    description: 'Help us plant 1000 trees across different areas of Dhaka to combat air pollution and create a greener city. We will provide saplings, tools, and guidance on proper tree planting techniques. This initiative aims to increase the city\'s green cover and improve air quality for future generations.',
    eventType: 'Plantation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
    location: 'Dhanmondi Lake Area, Dhaka',
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Winter Clothes Donation Drive',
    description: 'Collecting warm clothes, blankets, and winter essentials for underprivileged families. Your donations will be distributed to those in need during the cold season. We accept new or gently used items including sweaters, jackets, blankets, and socks. Drop-off locations will be available throughout the city.',
    eventType: 'Donation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    location: 'Gulshan Community Center, Dhaka',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Free Computer Literacy Workshop',
    description: 'Learn basic computer skills including Microsoft Office, internet browsing, and email management. This workshop is designed for beginners and will help participants gain essential digital skills for personal and professional development. All equipment and materials will be provided. Limited seats available.',
    eventType: 'Education',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    location: 'Banani Public Library, Dhaka',
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Free Health Checkup Camp',
    description: 'Free medical checkup including blood pressure, blood sugar, BMI measurement, and general health consultation. Qualified doctors and nurses will be available to provide health advice and basic treatment. This camp aims to promote preventive healthcare and early detection of health issues in the community.',
    eventType: 'Healthcare',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
    location: 'Mirpur Community Health Center, Dhaka',
    eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Blood Donation Drive',
    description: 'Join our blood donation drive to help save lives. All donors will receive a health checkup, refreshments, and a certificate of appreciation. Your single donation can save up to three lives. Walk-in donors are welcome, but pre-registration is recommended to ensure smooth processing.',
    eventType: 'Healthcare',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800',
    location: 'Square Hospital, Dhanmondi, Dhaka',
    eventDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Street Children Education Support',
    description: 'Volunteer to teach basic literacy and numeracy to street children. We provide teaching materials, lesson plans, and training for volunteers. This program aims to give street children access to education and improve their future prospects. No prior teaching experience required, just a willingness to help.',
    eventType: 'Education',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    location: 'Kamalapur Railway Station Area, Dhaka',
    eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Food Distribution for Homeless',
    description: 'Help distribute nutritious meals to homeless individuals in the city. We will prepare and distribute hot meals, water, and essential supplies. This event requires volunteers to help with food preparation, packaging, and distribution. Together we can make a difference in someone\'s day.',
    eventType: 'Donation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-2c027eb9ef16?w=800',
    location: 'Farmgate Area, Dhaka',
    eventDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Park Cleanup and Beautification',
    description: 'Join us in cleaning and beautifying a local park. Activities include picking up litter, planting flowers, painting benches, and organizing recreational areas. This initiative will create a cleaner and more enjoyable space for families and children in the community.',
    eventType: 'Cleanup',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    location: 'Ramna Park, Dhaka',
    eventDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 9 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Mangrove Plantation in Sundarbans',
    description: 'Participate in our mangrove plantation drive to protect the Sundarbans ecosystem. Mangroves are crucial for coastal protection and biodiversity. We will plant mangrove saplings and learn about their importance in maintaining ecological balance. Transportation and lunch will be provided.',
    eventType: 'Plantation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    location: 'Sundarbans, Khulna',
    eventDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Digital Skills Training for Women',
    description: 'Empower women with essential digital skills including online safety, social media marketing, and e-commerce basics. This workshop is designed specifically for women who want to start their own online business or improve their digital literacy. Childcare facilities available upon request.',
    eventType: 'Education',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    location: 'Women\'s Development Center, Gulshan, Dhaka',
    eventDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 18 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'River Cleanup Initiative',
    description: 'Help clean up the Buriganga River and raise awareness about water pollution. We will collect floating waste, organize awareness sessions, and document the impact of pollution on our waterways. This is a critical initiative to protect one of Dhaka\'s most important water sources.',
    eventType: 'Cleanup',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    location: 'Sadarghat, Buriganga River, Dhaka',
    eventDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 11 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'School Supplies Donation',
    description: 'Donate school supplies including notebooks, pens, pencils, bags, and uniforms for underprivileged students. Your contributions will help children continue their education and reduce the financial burden on their families. All donations will be distributed to verified schools and students in need.',
    eventType: 'Donation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    location: 'Uttara Community Center, Dhaka',
    eventDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 13 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Mental Health Awareness Session',
    description: 'Join our mental health awareness session to learn about stress management, anxiety coping strategies, and the importance of mental wellbeing. Licensed counselors will conduct the session and provide resources for seeking help. This event aims to break the stigma around mental health.',
    eventType: 'Healthcare',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
    location: 'Bashundhara City, Dhaka',
    eventDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 16 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  },
  {
    title: 'Community Garden Project',
    description: 'Help establish a community garden where residents can grow vegetables and herbs. This project promotes sustainable living, provides fresh produce, and creates a sense of community. We need volunteers for soil preparation, planting, and setting up irrigation systems.',
    eventType: 'Plantation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    location: 'Wari, Old Dhaka',
    eventDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 19 days from now
    creatorEmail: 'admin@socialserve.com',
    creatorName: 'SocialServe Admin',
    createdAt: new Date()
  }
];

async function seedEvents() {
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully');

    const database = client.db('socialEventsDB');
    const eventsCollection = database.collection('events');

    // Check if events already exist
    const existingEvents = await eventsCollection.countDocuments();
    console.log(`Found ${existingEvents} existing events in the database`);

    if (existingEvents > 0) {
      console.log('Events already exist. Clearing existing events...');
      await eventsCollection.deleteMany({});
      console.log('Cleared existing events');
    }

    console.log('Inserting default events...');
    const result = await eventsCollection.insertMany(defaultEvents);
    console.log(`Successfully inserted ${result.insertedCount} events`);

    // Display inserted events
    const insertedEvents = await eventsCollection.find({}).toArray();
    console.log('\nInserted Events:');
    insertedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.eventType} - ${event.eventDate}`);
    });

    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedEvents()
  .then(() => {
    console.log('Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });

