import './App.css'
import { Routes,Route } from 'react-router-dom'
import SingIn from './pages/SignIn'
import SingUp from './pages/SignUp'
import MyFiles from './pages/MyFiles'
import NotFound from './pages/NotFound'

function App() {
  // 1. "/" : 파일 조회 페이지(로그인 되어지있지 않다면 로그인 페이지로 라우팅)
  // 2. "/signin" : 로그인 페이지
  // 3. "/signup" : 회원가입 페이지
  return (
    <Routes>
      <Route path='/' element = {<MyFiles/>}></Route>
      <Route path='/signin' element = {<SingIn/>}></Route>
      <Route path='/signup' element = {<SingUp/>}></Route>
      <Route path='*' element={<NotFound />}></Route>
    </Routes>
  )
}

export default App
