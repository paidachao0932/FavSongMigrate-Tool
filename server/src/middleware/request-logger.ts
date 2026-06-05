import morgan from 'morgan';

export const requestLogger = morgan('[:date[iso]] :method :url :status :response-time ms');
