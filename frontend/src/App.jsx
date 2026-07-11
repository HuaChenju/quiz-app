import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import Game from "./pages/Game";
import Results from "./pages/Results";
import QuestionType from "./pages/QuestionType";
import AddQuestion from "./pages/AddQuestion";
import QuizEdit from "./pages/QuizEdit";
import PrivateRoute from "./components/PrivateRoute";
import EditQuestion from "./pages/EditQuestion";
import Room from "./pages/Room";
import JoinRoom from "./pages/JoinRoom";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
<Route 
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>

<Route
 path="/create-quiz"
 element={
   <PrivateRoute>
     <CreateQuiz />
   </PrivateRoute>
 }
/>
        <Route
  path="/game/:id"
  element={
    <PrivateRoute>
      <Game />
    </PrivateRoute>
  }
/>

        <Route path="/results" element={<PrivateRoute><Results /></PrivateRoute>} />

        <Route path="/question-type" element={<PrivateRoute><QuestionType /></PrivateRoute>} />

          <Route
              path="/quiz/:quizId/add-question"
              element={
                  <PrivateRoute>
                      <AddQuestion />
                  </PrivateRoute>
              }
          />
        <Route path="/quiz/:id" element={<PrivateRoute><QuizEdit /></PrivateRoute>} />

<Route
 path="/edit-question/:id"
 element={
   <PrivateRoute>
     <EditQuestion />
   </PrivateRoute>
 }
/>

<Route
  path="/room"
  element={
    <PrivateRoute>
      <Room />
    </PrivateRoute>
  }
/>

<Route
  path="/join-room"
  element={
    <PrivateRoute>
      <JoinRoom />
    </PrivateRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;