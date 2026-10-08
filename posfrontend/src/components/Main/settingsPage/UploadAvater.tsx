import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import { deepOrange } from '@mui/material/colors';
import useAxiosWithInterceptor from '../../../helper/jwtinterceptor';
import { outletsDataProps, outletStaffDataProps } from '../../../@types/outletsNstaff-service';
import { BASE_URL_ACCOUNT } from '../../../congif';



interface staffImageProps{
      outletStaffSelection?:outletStaffDataProps| null;
      outletSelection?:outletsDataProps | null
}
export default function UploadAvatars({outletStaffSelection,outletSelection}:staffImageProps) {
    const jwtAxios = useAxiosWithInterceptor();
   const [avatarSrc, setAvatarSrc] = React.useState<string | undefined>(outletStaffSelection?.image);
   const [avatarSrcOtlet, setAvatarSrcOutlet] = React.useState<string | undefined>(outletSelection?.outlogo);


     React.useEffect(() => {
    setAvatarSrcOutlet(outletSelection?.outlogo);
    setAvatarSrc(outletStaffSelection?.image);
  }, [outletStaffSelection,outletSelection]);
  

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    let formFile = new FormData()
    
    if (file) {
      formFile.append("image", file)
      const outletId = localStorage.getItem("outlet_id") || ""
      if(outletStaffSelection !==null && outletStaffSelection !== undefined){
            try{
              const response=await jwtAxios.patch(`${BASE_URL_ACCOUNT}/outletstaffs/${outletStaffSelection?.Employee_id}/`,
                formFile, {
                   params: {
                      outlet_id: outletId,
                    },
                  withCredentials:true} )
                  const reader = new FileReader();
                  reader.onload = () => {
              // avaterSrc=reader.result as string
                  setAvatarSrc(reader.result as string);
                  };
                  reader.readAsDataURL(file);
              return response.data
            }catch(err:any){
              
              throw err.response
            }

        }
      if(outletSelection !== null && outletSelection !==undefined){

          try{
              const response=await jwtAxios.patch(`${BASE_URL_ACCOUNT}/outlets/${outletSelection.id}/`,formFile, {withCredentials:true} )
                  const reader = new FileReader();
                  reader.onload = () => {
              // avaterSrc=reader.result as string
                  setAvatarSrcOutlet(reader.result as string);
                  };
                  reader.readAsDataURL(file);
              return response.data
            }catch(err:any){
              throw err.response
            }

      }
      
    }
  };

  return (
    <>
    {outletStaffSelection&&

    <ButtonBase
      component="label"
      role={undefined}
      tabIndex={-1} // prevent label from tab focus
      aria-label="Avatar image"
      sx={{
        borderRadius: '40px',
        '&:has(:focus-visible)': {
          outline: '2px solid',
          outlineOffset: '2px',
        },
      }}
    >
        {!avatarSrc?
        (
             <Avatar alt="Upload new avatar" 
            //  src={avatarSrc} 
                sx={{
                     width:"50px",
                        height:"50px",
                     bgcolor: deepOrange[500] }}
                src="/broken-image.jpg"
             >
                {outletStaffSelection?.name.charAt(0).toUpperCase()}
            </Avatar>
        ):
        (
            <Avatar alt="Staff avatar" src={avatarSrc}
                 sx={{
                     width:"70px",
                    height:"70px",
                     bgcolor: deepOrange[500] }}
             />
        )
        }
      
      <input
        type="file"
        accept="image/*"
        style={{
          border: 0,
          clip: 'rect(0 0 0 0)',
          height: '1px',
          margin: '-1px',
          overflow: 'hidden',
          padding: 0,
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px',
        }}
        onChange={handleAvatarChange}
      />
    </ButtonBase>
    
    }
    {outletSelection &&
    <ButtonBase
      component="label"
      role={undefined}
      tabIndex={-1} // prevent label from tab focus
      aria-label="Avatar image"
      sx={{
        borderRadius: '40px',
        '&:has(:focus-visible)': {
          outline: '2px solid',
          outlineOffset: '2px',
        },
      }}
    >
        {!avatarSrcOtlet?
        (
             <Avatar alt="Upload new avatar" 
            //  src={avatarSrc} 
                sx={{
                     width:"50px",
                        height:"50px",
                     bgcolor: deepOrange[500] }}
                src="/broken-image.jpg"
             >
                {outletSelection?.name.split('')[0].toUpperCase()}
            </Avatar>
        ):
        (
            <Avatar alt="Staff avatar" src={avatarSrcOtlet}
                 sx={{
                     width:"70px",
                    height:"70px",
                     bgcolor: deepOrange[500] }}
             />
        )
        }
      
      <input
        type="file"
        accept="image/*"
        style={{
          border: 0,
          clip: 'rect(0 0 0 0)',
          height: '1px',
          margin: '-1px',
          overflow: 'hidden',
          padding: 0,
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px',
        }}
        onChange={handleAvatarChange}
      />
    </ButtonBase>
    }
    </>
    
  );
}
