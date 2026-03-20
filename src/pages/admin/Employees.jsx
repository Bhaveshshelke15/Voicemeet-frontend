import { useEffect, useState } from "react";
import API from "../../api/api";
import "../../styles/employees.css";

export default function Employees(){

  const [employees,setEmployees] = useState([]);
  const [search,setSearch] = useState("");

  useEffect(()=>{
    fetchEmployees();
  },[]);

  const fetchEmployees = async()=>{

    try{

      const res = await API.get("/admin/users");

      console.log(res.data);

      setEmployees(res.data);

    }catch(err){
      console.error(err);
    }

  };

  const filteredEmployees = employees.filter(emp =>
    (emp.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return(

    <div className="employees-page">

      <div className="employees-header">

        <h2>Employee List</h2>

        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

      </div>

      <table className="employees-table">

        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Password</th>
          </tr>
        </thead>

        <tbody>

          {filteredEmployees.map((emp)=>(

            <tr key={emp.userId}>

              <td>{emp.userId}</td>
              <td>{emp.name || "No Name"}</td>
              <td>{emp.password}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}