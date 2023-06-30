import * as dgram from "dgram";

function checkUDPPort(port: number, host: string) {
  const client = dgram.createSocket('udp4');

  // Set a timeout for the UDP socket
  const timeout = 2000; // 2 seconds

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      client.close(); // Close the UDP socket
      reject(`No response from UDP port ${port}`);
    }, timeout);

    client.on('message', (message) => {
      clearTimeout(timeoutId); // Cancel the timeout
      client.close(); // Close the UDP socket
      resolve(`Received response from UDP port ${port}`);
    });

    client.on('error', (err) => {
      clearTimeout(timeoutId); // Cancel the timeout
      reject(`Error occurred on UDP port ${port}: ${err.message}`);
    });

    // Send an empty UDP message to the specified port and host
    client.send('', port, host);
  });
}

// Usage example
const portToCheck = 5000;
const hostToCheck = 'localhost'; // Replace with the appropriate host

checkUDPPort(portToCheck, hostToCheck)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
