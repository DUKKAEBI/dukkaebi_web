import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Main from './page/main'
import Profile from './page/profile'
import './App.css'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Main />} />
				<Route path="/profile" element={<Profile />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
