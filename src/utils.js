import axios from 'axios';

export const startProcess = (url, data, setLog, setEventSource, currentEventSource) => {
  setLog('');

  if (currentEventSource) {
    currentEventSource.close();
  }

  axios.post(url, data)
    .then(response => {
      setLog('Process started\n');
      const newEventSource = new EventSource(`${url.replace('start-', '')}`);
      setEventSource(newEventSource);

      newEventSource.onmessage = (event) => {
        setLog(prevLog => prevLog + event.data + '\n');

        if (event.data.includes('Success') || event.data.includes('Error')) {
          newEventSource.close();
          setEventSource(null);
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

        if (event.target.readyState === EventSource.CLOSED) {
          newEventSource.close();
          setEventSource(null);
        }
      };

      newEventSource.onclose = () => {
        setLog(prevLog => prevLog + 'Connection closed\n');
        setEventSource(null);
      };
    })
    .catch(error => {
      console.error('Axios request failed:', error);
      setLog(`Error: ${error.message || 'Request failed'}\n`);
    });
};
