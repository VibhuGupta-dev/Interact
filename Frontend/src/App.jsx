
import axios from "axios"
import './App.css'

function App() {
  
const fetch = async () => {
  try {
    const res= await axios.post("http://localhost:5000/room/api/createroom" )
    console.log(res)
   
  }catch(err) {
console.log(err)
  }
}
   
  
  return (
<>
<button onClick={fetch}>ok</button>
</>
  )
}

export default App
