import net from 'net';

export async function checkTCPPort(port: number, host: string, timeout: number) {
  const start = performance.now();
  const response = await processData(port, host, timeout)
  return {response, responseTime: performance.now() - start}
}

const processData = (port: number, host: string, timeout: number) => {
  return new Promise<string>((resolve, reject) => {
    const client = net.createConnection(port, host);

    // Set a timeout for the TCP connection
    let responseData = '';

    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      client.destroy(); // Abort connection
      reject(`No response from TCP port ${port}`);
    }, timeout);

    client.on('data', (data) => {
      responseData += data.toString();
    });

    client.on('end', () => {
      clearTimeout(timeoutId); // Cancel the timeout
      client.destroy(); // Close the TCP connection
      resolve(responseData);
    });

    client.on('error', (err) => {
      clearTimeout(timeoutId); // Cancel the timeout
      reject(`Error occurred on TCP port ${port}: ${err.message}`);
    });
  });
}
