import React from 'react';
import { create } from 'react-test-renderer';
import App from '../app';

test('App renders correctly', () => {
  const app = create(<App />);
  expect(app).toBeTruthy();
});