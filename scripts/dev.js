const { execSync, exec } = require('child_process');
const os = require('os');
const http = require('http');
const dns = require('dns');

// Get local IP addresses
const getLocalIpAddresses = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];
    for (const info of interfaceInfo) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (info.family === 'IPv4' && !info.internal) {
        addresses.push(info.address);
      }
    }
  }
  
  return addresses;
};

// Check if the port is already in use
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

// Check internet connection
const checkInternetConnection = () => {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      resolve(!err);
    });
  });
};

// Check Windows firewall status
const checkWindowsFirewall = () => {
  try {
    const output = execSync('netsh advfirewall show allprofiles state', { encoding: 'utf8' });
    return output;
  } catch (error) {
    return "Could not check firewall status";
  }
};

// Main function
async function main() {
  // Display IP addresses
  const ipAddresses = getLocalIpAddresses();
  
  console.log('\n🔍 NETWORK INFORMATION:');
  console.log('------------------------');
  console.log('Computer Name:', os.hostname());
  
  if (ipAddresses.length === 0) {
    console.log('❌ No network connections found. Check your network settings.');
  } else {
    console.log('\n✅ Your local IP addresses:');
    ipAddresses.forEach(ip => {
      console.log(`   http://${ip}:3000   👈 Use this in your mobile browser`);
    });
  }
  
  // Check port availability
  const isPortAvailable = await checkPort(3000);
  if (!isPortAvailable) {
    console.log('\n⚠️ Warning: Port 3000 is already in use!');
    console.log('   This may cause the server to fail starting or create conflicts.');
    console.log('   Try closing other applications that might be using this port.');
  }
  
  // Check internet
  const hasInternet = await checkInternetConnection();
  console.log(`\n${hasInternet ? '✅' : '❌'} Internet connection: ${hasInternet ? 'Connected' : 'Not connected'}`);
  
  // Check firewall on Windows
  if (process.platform === 'win32') {
    console.log('\n🔒 Windows Firewall Status:');
    console.log(checkWindowsFirewall());
    
    console.log('\n⚠️ IMPORTANT: If you cannot connect from your mobile device:');
    console.log('   1. Make sure both devices are on the same WiFi network');
    console.log('   2. Try temporarily disabling Windows Firewall');
    console.log('      - Search for "Windows Defender Firewall" in Start menu');
    console.log('      - Click "Turn Windows Defender Firewall on or off"');
    console.log('      - Select "Turn off Windows Defender Firewall" for private networks');
    console.log('   3. Or add an exception for Node.js/port 3000 in your firewall settings');
  }
  
  console.log('\n📱 MOBILE CONNECTION TROUBLESHOOTING:');
  console.log('   1. Ensure your phone is connected to the same WiFi network as this computer');
  console.log('   2. Try accessing the app using the exact URL format shown above');
  console.log('   3. If still not working, try pinging this computer from your phone');
  console.log('      (You may need a network tools app on your phone)');
  
  console.log('\n🚀 Starting Next.js development server...\n');
  
  // Run the Next.js dev server
  try {
    execSync('next dev --hostname 0.0.0.0', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error starting Next.js development server:', error);
    process.exit(1);
  }
}

main();
