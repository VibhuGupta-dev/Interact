import { createContext , useContext} from "react";
import { useSelector , useDispatch } from "react-redux";
import { setPeer } from "../Redux/Features/UserSlice";

const PeerContext = createContext(null);


export function VideoStream () {

    const dispatch = useDispatch()
    
    dispatch(setPeer(PeerContext))
    console.log(PeerContext)

    return (
    <>
   <div className="">
    hey
   </div>
    </>
)
}
