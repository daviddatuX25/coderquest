import { useEffect } from 'react';
import EventBus from '../../shared/EventBus';

const useGameEvent = (eventName, handler) => {
  useEffect(() => {
    EventBus.on(eventName, handler);
    return () => {
      EventBus.off(eventName, handler);
    };
  }, [eventName, handler]);
};

export default useGameEvent;
