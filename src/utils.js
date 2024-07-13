import axios from 'axios';

export const startProcess = (url, data, setLog, setEventSource, currentEventSource, setIsProcessRunning) => {
  setLog('');

  if (currentEventSource) {
    console.log('Closing current EventSource'); // Debug message
    currentEventSource.close();
  }

  axios.post(url, data)
    .then(response => {
      console.log('Process started'); // Debug message
      const newEventSource = new EventSource(`${url.replace('start-', '')}`);
      console.log('New EventSource created:', newEventSource); // Debug message
      setEventSource(newEventSource);

      newEventSource.onmessage = (event) => {
        console.log('Event Source Message:', event.data); // Debug message
        setLog(prevLog => prevLog + event.data + '\n');

        if (event.data.includes('Success') || event.data.includes('Error')) {
          console.log('Success or Error received, closing EventSource'); // Debug message
          newEventSource.close();
          setEventSource(null);
          setIsProcessRunning(false); // Update the running state
          setLog(prevLog => prevLog + 'Connection closed\n');
        }
      };

      newEventSource.onerror = (event) => {
        let errorMessage = 'An error occurred';
        if (event && event.message) {
          errorMessage = event.message;
        } else if (event && event.target && event.target.readyState === EventSource.CLOSED) {
          errorMessage = 'Connection closed';
        } else if (event && event.target && event.target.readyState === EventSource.CONNECTING) {
          errorMessage = 'Reconnecting';
        }

        console.error('EventSource error:', event);
        setLog(prevLog => prevLog + `Error: ${errorMessage}\n`);
        setIsProcessRunning(false); // Update the running state

        if (event.target.readyState === EventSource.CLOSED) {
          newEventSource.close();
          setEventSource(null);
        }
      };

      newEventSource.onclose = () => {
        console.log('Event Source Closed'); // Debug message
        setLog(prevLog => prevLog + 'Connection closed\n');
        setEventSource(null);
        setIsProcessRunning(false); // Update the running state
      };
    })
    .catch(error => {
      console.error('Axios request failed:', error);
      setLog(`Error: ${error.message || 'Request failed'}\n`);
      setIsProcessRunning(false); // Update the running state
    });
};
