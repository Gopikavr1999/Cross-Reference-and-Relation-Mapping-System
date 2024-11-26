import { useEffect, useState } from 'react';
import axios from "axios";
import './App.css'
import Upload from './components/Upload'
import { api } from './components/api';

function App() {
  const [file, setFile] = useState(null);
  const [collections, setCollections] = useState([]);
  const [master1, setMaster1] = useState('');  // State for Master 1 selection
  const [master2, setMaster2] = useState(''); 
  const [masterKey1, setMasterKey1] = useState([]); 
  const [masterKey2, setMasterKey2] = useState([]); 
  const [key1, setKey1] = useState(""); 
  const [key2, setKey2] = useState(""); 
  // const [isUploading, setIsUploading] = useState(false); // Track the upload status

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const handleUpload = async () => {
    console.log("hii");
    
    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    const formData = new FormData();
    formData.append("csv", file);

    // setIsUploading(true);
    try {
      const response = await axios.post(
        "http://localhost:7000/upload",
        formData
      );
      console.log("response", response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    } 
    // finally {
    //   setIsUploading(false); // Enable the button after upload
    // }
  }

  useEffect(() => {
    const fetchCollectionName = async() => {
      console.log("fetchcollectionname");
      
      const response = await axios.get(`${api}/fetchCollection`)
      console.log("response",response.data);
      setCollections(response.data)
      
    }
    fetchCollectionName()
  },[]);

// Create a function to fetch keys
const fetchKeys = async (master) => {
  if (master) {
    try {
      const keys = await axios.post(`${api}/fetchKeys`, { master });
      console.log("keys", keys.data);

      // Set the keys based on which master was selected
      if (master === master1) {
        setMasterKey1(keys.data.keys); // Assuming keys.data has an object with keys property
        console.log("masterKey1", keys.data.keys);
      } else if (master === master2) {
        setMasterKey2(keys.data.keys);
        console.log("masterKey2", keys.data.keys);
      }
    } catch (error) {
      console.error("Error fetching keys:", error);
    }
  }
};

// Fetch keys when master1 or master2 changes
useEffect(() => {
  if (master1) {
    fetchKeys(master1);
  }
}, [master1]);

useEffect(() => {
  if (master2) {
    fetchKeys(master2);
  }
}, [master2]);


  const handleMap = async() => {
    const map = await axios.post(`${api}/map`,{master1,master2,key1,key2});
    console.log("mapped res", map);
    
  };

  const handleMostMatch = async() => {
    const mostMatch = await axios.post(`${api}/mostMatch`,{master2,key1,key2});
    console.log("Most match response",mostMatch);
    
  }
  const handleRemoveDuplicateID = async() => {   
    const response = await axios.post(`${api}/removeDuplicate`,{master2,key1,key2})
  }
  return (
    <>
      <div>
        <Upload
          onFileChange={handleFileChange}
          onFileUpload={handleUpload}
          // disabled={isUploading}
        />
      </div>
      <div>
        <label >Master 1</label>
        <select
          value={master1}
          onChange={(e)=> setMaster1(e.target.value)}
        > 
        {collections.map((collection)=> (
          <option key={collection} value={collection}>{collection}</option>
        ))}
        </select>
        <label>Key</label>
        <select
        value={key1}
        onChange={(e)=> setKey1(e.target.value)}
        >
          {masterKey1.map((keys)=>(
            <option>{keys}</option>
          ))}

        </select>
        
      </div>
      <div>
        <label >Master 2</label>
        <select
          value={master2}
          onChange={(e)=> setMaster2(e.target.value)}
        > 
        {collections.map((collection)=> (
          <option key={collection} value={collection}>{collection}</option>
        ))}
        </select>
        <label>Key</label>
        <select
        value={key2}
        onChange={(e)=> setKey2(e.target.value)}
        >
          {masterKey2.map((keys)=>(
            <option>{keys}</option>
          ))}

        </select>
      </div>
        <button onClick={handleMap}>Map</button>
        <button onClick={handleMostMatch}>Most Match</button>
        <button onClick={handleRemoveDuplicateID}>Final Step</button>
    </>
  )
}

export default App
