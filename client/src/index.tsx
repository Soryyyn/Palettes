import { h, render } from 'preact';
import 'preact/devtools'; // used for devtools extension in browser
import App from './App.js';
import '@app/index.scss';

const root = document.getElementById('root')

if (root) {
	render(<App />, root);
}
