import React from 'react';
import { render } from 'react-dom';
import Wall from './Wall';

const mountNode = document.getElementById('wall');

render(<Wall targets={[{ target: "#target", screen: false }]} />, mountNode);