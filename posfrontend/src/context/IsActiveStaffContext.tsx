import React from "react"

interface isActiveStaffContextProps {
    session_id : string;
    isStaffActive:boolean;
}

export const isActiveStaffContext = React.createContext<isActiveStaffContextProps |null>(null)

const isActiveStaffProvider =({children}:React.PropsWithChildren)=>{
    const isStaffActiveStatus = unkniw()

    return(
        <isActiveStaffContext.Provider value={isStaffActiveStatus}>
            {children}
        </isActiveStaffContext.Provider>
    )
}


export const useIsActiveStaff =():isActiveStaffContextProps=>{
    const context = React.useContext(isActiveStaffContext);
    if(!context){
        throw new Error("Error - You have to use the isActiveStaffProvider");
    }
    return context;
    
}

export default isActiveStaffProvider