import Home from './pages/Home'
import {BrowserRouter, Route, Routes } from 'react-router-dom'
import Products from './pages/Products';
import AuthServiceProvider from './context/AuthContext';
import OutletNstaffContextProvider from "./context/OutletNStaffsContext";
import Categories from './pages/Categories';
import Measurements from './pages/Measurements';
import PastReceipt from './pages/PastReceipt';
import SalesByProduct from './pages/SalesByProduct';
import ToggleColorMode from './components/ToggleColorMode';
import ViewUpdateProfile from './pages/account/ViewUpdateProfile';
import Settings from './pages/Settings';
import SalesNReceipt from './pages/SalesNReceipt';
import LoginTemplate from './pages/LoginTemplate';
import ConfirmationTemplate from './pages/templates/ConfirmationTemplate';
import ForgotPasswordTemplate from './pages/templates/ForgotPasswordTemplate';
import { useEffect, useState } from 'react';
import qz from "qz-tray";
import DetailedProductSummary from './pages/DetailedProductSummary';
import UserGuide from './pages/UserGuide';
import AuthorizationPage from './pages/AuthorizationPage';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import ProtectedRoute from './services/ProtectedRoutes';






function App() {
    const [protectionMessage, setProtectionMessage] = useState<null | string>(null)
    useEffect(() => {

        async function connectPrinter() {

            if (!qz.websocket.isActive()) {
                await qz.websocket.connect();
                 console.log("QZ Connected");
            }

        }

        connectPrinter();

    }, []);
    useEffect(()=>{
      const getProtectionMessage = () => {
          const accessDenied =
              sessionStorage.getItem("protected_route");

          if (!accessDenied) {
              return;
          }

          setProtectionMessage(accessDenied);
      };
      getProtectionMessage()

      window.addEventListener(
          "popstate",
          getProtectionMessage
      );
      window.addEventListener(
          "pageshow",
          getProtectionMessage
      );
      return () => {
          window.removeEventListener(
              "popstate",
              getProtectionMessage
          );

          window.removeEventListener(
              "pageshow",
              getProtectionMessage
          );
      };

    },[])

  return (
    
      <BrowserRouter>
      <AuthServiceProvider>
        <OutletNstaffContextProvider>
          <ToggleColorMode>
             <Snackbar
                  open={protectionMessage !== null}
                  autoHideDuration={3000}
                  
                  onClose={() =>
                  {sessionStorage.removeItem("protected_route")
                     setProtectionMessage(null)}
                    }
                  anchorOrigin={{
                      vertical: "top",
                      horizontal: "center",
                  }}
              >
                  <Alert
                      severity="error"
                      onClose={
                        () =>{
                          sessionStorage.removeItem("protected_route")
                          setProtectionMessage(null)
                      } 
                      }
                  >
                      {protectionMessage}
                  </Alert>
              </Snackbar>
          <Routes>
            <Route  path='/' element={ 
              <ProtectedRoute access='adminOrSupervisor'>
                  <Home/> 
              </ProtectedRoute>
              
              }
            />
            <Route  path='/categories' element={ 
              <ProtectedRoute access='all' >
                  <Categories/> 
              </ProtectedRoute>
              
              }
            />
            <Route  path='/measurements' element={ 
              <ProtectedRoute access='all' >
                  <Measurements/> 
              </ProtectedRoute>
              
              }
            />
            <Route  path='/sales_summary' element={ 
              <ProtectedRoute access='adminOrSupervisor'>
                  <SalesByProduct/> 
              </ProtectedRoute>
              
              }
            />
            <Route  path='/sales_summary/:productId' element={ 
              <ProtectedRoute  access='adminOrSupervisor'>
                  <DetailedProductSummary/> 
              </ProtectedRoute>
              
              }
            />
            <Route  path='/profile' element={ 
              <ProtectedRoute access='adminOnly'>
                  <ViewUpdateProfile/> 
              </ProtectedRoute>
              
              }
            />
             <Route  path='/products' element={ 
              <ProtectedRoute access='all'>
                  <Products/> 
              </ProtectedRoute>
              
              }
            />
            <Route  path='/sales_receipts' element={ 
              <ProtectedRoute access='all'>
                  <SalesNReceipt/> 
              </ProtectedRoute>
              
              }
            />
            <Route  path='/past_receipts' element={ 
              <ProtectedRoute access='all'>
                  <PastReceipt/> 
              </ProtectedRoute>
              
              }
            />
            <Route  path='/settings' element={ 
              <ProtectedRoute access='all'>
                  <Settings/> 
              </ProtectedRoute>
              
              }
            />
            
            {/* <Route path='/create_receipt' element={<SalesNReceipt/>} />
            <Route path='/sales_receipts' element={<SalesNReceipt/>} /> */}
            
            <Route path='/email_confirmation' element={<ConfirmationTemplate/>} />
            <Route path='/forgot_password' element={<ForgotPasswordTemplate/>} />
            {/* <Route path='/categories' element={<Categories/>} /> */}
            {/* <Route path='/measurements' element={<Measurements/>} /> */}
            {/* <Route path='/past_receipts' element={<PastReceipt/>} /> */}
            {/* <Route path='/sales_summary' element={<SalesByProduct/>} /> */}
            {/* <Route path='/sales_summary/:productId' element={<DetailedProductSummary/>} /> */}
            {/* <Route path='/profile' element={<ViewUpdateProfile/>} /> */}
            {/* <Route path='/settings' element={<Settings/>} /> */}
            
            
            
            <Route path='/login' element={<LoginTemplate/>} />
            <Route path='/guide' element={<UserGuide/>} />
            <Route path='/authorization' element={<AuthorizationPage/>} />
            
          </Routes> 
        
        </ToggleColorMode>
        </OutletNstaffContextProvider>
        
      </AuthServiceProvider>
    </BrowserRouter>
   

    
     
  )
}

export default App
