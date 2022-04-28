import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {InputContext} from '../components/ThemedInput';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepLabel from '@mui/material/StepLabel';
import ThemedButton from '../components/ThemedButton';
import ThemedInput from '../components/ThemedInput';
import SignupBanner from '../assets/SignupBanner.png';
import verifyEmail from '../util/EmailVerification';
import '../stylesheets/LoginSignup.css';

const PaperStyling = {
  display: 'flex',
  width: '1000px',
  height: '600px',
  borderRadius: '10px',
  filter: 'drop-shadow(0px 15px 40px rgba(192, 225, 255, 0.1))',
  color: 'inherit',
};

const StepperPaperStyling = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  paddingInline: '30px',
  width: '40em',
  height: '4em',
  borderRadius: '10px',
  filter: 'drop-shadow(0px 15px 40px rgba(192, 225, 255, 0.1))',
  color: '#8B95A5',
};

const StepperStyling = {
  'width': '100%',
  '.MuiStepLabel-labelContainer span': {
    fontFamily: 'Montserrat',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#3C4047',
  },
  '.MuiStepIcon-text': {
    fontFamily: 'Montserrat',
    fontWeight: '700',
    fill: 'white',
  },
  '.MuiStepIcon-root.Mui-active': {
    color: '#FBC02D',
  },
  '.MuiStepIcon-root.Mui-completed': {
    color: '#FBC02D',
  },
};

/**
 * Creates signup page
 * @return {HTML} signup page
 */
export default function TestSignup() {
  const [stepNumber, setStepNumber] = useState(0);
  const [createdProfileData, setCreatedProfileData] = useState(null);
  const [values, setValues] = useState({
    0: {
      firstname: '',
      lastname: '',
    },
    1: {
      schoolemail: '',
      graduationyear: '',
    },
    2: {
      useremail: '',
      userpassword: '',
      active: 'false',
    },
  });

  const createUser = () => {
    fetch(`/api/userCreation`, {
      method: 'POST',
      body: JSON.stringify(values[2]),
      headers: {
        'Content-Type': 'application/json',
      },
    })
        .then((res) => {
          if (!res.ok) {
            throw res;
          }
          return res.json();
        })
        .then((json) => {
          fetch(`/api/profileCreation`, {
            method: 'POST',
            body: JSON.stringify({userid: json.userid}),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          toast.success('Account created', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          setCreatedProfileData(json);
          verifyEmail(json);
          setValues((prevValues) => ({
            ...prevValues,
            [2]: {
              ...prevValues[2],
              useremail: '',
              userpassword: '',
              active: 'false',
            },
          }));
        });
  };

  const checkValues = (object) => {
    return Object.values(object).every((v) => v && typeof v === 'object' ?
      checkValues(v) : v.length > 0,
    );
  };

  const handleSubmit = (e) => {
    const checkStep1 = checkValues(values[0]);
    const checkStep2 = checkValues(values[1]);
    const checkStep3 = checkValues(values[2]);

    if (checkStep1 && checkStep2 && checkStep3) {
      createUser();
      handleNextStep(3);
    } else {
      alert('Fill in all the required fields.');
    }
  };

  const handleResend = () => {
    console.log(createdProfileData);
    verifyEmail(createdProfileData);
  };

  const handleNextStep = (step) => {
    setStepNumber(step);
  };

  return (
    <InputContext.Provider value={[values, setValues]}>
      <Box className='page'>
        <Paper className='card' elevation={0} sx={PaperStyling}>
          <div className='card-banner flow-small padding-64'>
            <p className='text-bold text-italic text-white'>Logo.</p>
            <h3 className='text-xbold text-white'>
              Grow your connection with the UCSC community!
            </h3>
            <img src={SignupBanner} />
          </div>
          <Box
            className='card-content padding-64'
            component='form'
            noValidate
            autoComplete='on'
          >
            <SignupStepOne
              active={stepNumber === 0}
              step={0}
              handleNextStep={(e) => handleNextStep(e)}
            />
            <SignupStepTwo
              active={stepNumber === 1}
              step={1}
              handleNextStep={(e) => handleNextStep(e)}
            />
            <SignupStepThree
              active={stepNumber === 2}
              step={2}
              handleNextStep={(e) => handleNextStep(e)}
              handleSubmit={handleSubmit}
            />
            <SignupStepFour
              active={stepNumber === 3}
              step={3}
              handleNextStep={(e) => handleNextStep(e)}
              handleResend={handleResend}
            />
          </Box>
        </Paper>
        <SignupStepper
          stepNumber={stepNumber}
          handleNextStep={(e) => handleNextStep(e)}
          values={values}
          checkValues={checkValues}
        />
      </Box>
    </InputContext.Provider>
  );
}

/**
 * Stepper for signup
 * @return {JSX}
 */
function SignupStepper({stepNumber, handleNextStep, values, checkValues}) {
  const steps = ['Name', 'School', 'Email', 'Verification'];

  return (
    <Paper className='stepper' elevation={0} sx={StepperPaperStyling}>
      <Box sx={StepperStyling}>
        <Stepper nonLinear activeStep={stepNumber}>
          {steps.map((label, index) => (
            <Step
              key={label}
              completed={
                (index < 3 && checkValues(values[index])) || stepNumber === 3
              }
            >
              {index < 3 ?
                <StepButton
                  color='inherit'
                  onClick={stepNumber < 3 ? () => handleNextStep(index) : null}
                  disableRipple
                >
                  {label}
                </StepButton> :
                <StepLabel>{label}</StepLabel>
              }
            </Step>
          ))}
        </Stepper>
      </Box>
    </Paper>
  );
}

/**
 * Step one of signup
 * @return {JSX}
 */
function SignupStepOne({active, step, handleNextStep}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/login');
  };

  return (
    <div className='flow-large' style={{display: active ? null : 'none'}}>
      <div>
        <h2 className='text-normal'>Signup</h2>
        <p className='text-light text-warning'>
          Required <span className='text-bold'>*</span>
        </p>
      </div>
      <div className='grid-flow-large'>
        <div className='grid-flow-small'>
          <p className='text-bold'>
            First Name <span className='text-bold text-warning'>*</span>
          </p>
          <ThemedInput
            placeholder={'Bob'}
            type={'text'}
            index={'firstname'}
            step={step}
          />
        </div>
        <div className='grid-flow-small'>
          <p className='text-bold'>
            Last Name <span className='text-bold text-warning'>*</span>
          </p>
          <ThemedInput
            placeholder={'Smith'}
            type={'text'}
            index={'lastname'}
            step={step}
          />
        </div>
      </div>
      <div className='grid-flow-small'>
        <div className='flex-flow-small'>
          <ThemedButton
            color={'yellow'}
            variant={'themed'}
            value={step}
            onClick={(e) => handleNextStep(Number(e.target.value) + 1)}
          >
            Next Step
          </ThemedButton>
        </div>
        <p className='text-light'>
          Already have an account?
          <span
            className='text-bold text-blue clickable'
            onClick={handleNavigate}
          >
            &nbsp;Login here
          </span>
        </p>
      </div>
    </div>
  );
}

/**
 * Step two of signup
 * @return {JSX}
 */
function SignupStepTwo({active, step, handleNextStep}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/login');
  };

  return (
    <div className='flow-large' style={{display: active ? null : 'none'}}>
      <div>
        <h2 className='text-normal'>Signup</h2>
        <p className='text-light text-warning'>
          Required <span className='text-bold'>*</span>
        </p>
      </div>
      <div className='grid-flow-large'>
        <div className='grid-flow-small'>
          <p className='text-bold'>School Email</p>
          <ThemedInput
            placeholder={'bobsmith@ucsc.edu'}
            type={'text'}
            index={'schoolemail'}
            step={step}
          />
        </div>
        <div className='grid-flow-small'>
          <p className='text-bold'>
            Year of Graduation <span className='text-bold text-warning'>*</span>
          </p>
          <ThemedInput
            placeholder={'1997'}
            type={'text'}
            index={'graduationyear'}
            step={step}
          />
        </div>
      </div>
      <div className='grid-flow-small'>
        <div className='flex-flow-large'>
          <ThemedButton
            color={'yellow'}
            variant={'cancel'}
            value={step}
            onClick={(e) => handleNextStep(Number(e.target.value) - 1)}
          >
            Back
          </ThemedButton>
          <ThemedButton
            color={'yellow'}
            variant={'themed'}
            value={step}
            onClick={(e) => handleNextStep(Number(e.target.value) + 1)}
          >
            Next Step
          </ThemedButton>
        </div>
        <p className='text-light'>
          Already have an account?
          <span
            className='text-bold text-blue clickable'
            onClick={handleNavigate}
          >
            &nbsp;Login here
          </span>
        </p>
      </div>
    </div>
  );
}

/**
 * Step three of signup
 * @return {JSX}
 */
function SignupStepThree({active, step, handleNextStep, handleSubmit}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/login');
  };

  return (
    <div className='flow-large' style={{display: active ? null : 'none'}}>
      <div>
        <h2 className='text-normal'>Signup</h2>
        <p className='text-light text-warning'>
          Required <span className='text-bold'>*</span>
        </p>
      </div>
      <div className='grid-flow-large'>
        <div className='grid-flow-small'>
          <p className='text-bold'>
            Email <span className='text-bold text-warning'>*</span>
          </p>
          <ThemedInput
            placeholder={'bobsmith@gmail.com'}
            type={'text'}
            index={'useremail'}
            step={step}
          />
        </div>
        <div className='grid-flow-small'>
          <p className='text-bold'>
            Password <span className='text-bold text-warning'>*</span>
          </p>
          <ThemedInput
            placeholder={'8+ Characters, 1 Capital Letter'}
            type={'password'}
            index={'userpassword'}
            step={step}
          />
        </div>
      </div>
      <div className='grid-flow-small'>
        <div className='flex-flow-large'>
          <ThemedButton
            color={'yellow'}
            variant={'cancel'}
            value={step}
            onClick={(e) => handleNextStep(Number(e.target.value) - 1)}
          >
            Back
          </ThemedButton>
          <ThemedButton
            color={'yellow'}
            variant={'themed'}
            type={'submit'}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            Create account
          </ThemedButton>
        </div>
        <p className='text-light'>
          Already have an account?
          <span
            className='text-bold text-blue clickable'
            onClick={handleNavigate}
          >
            &nbsp;Login here
          </span>
        </p>
      </div>
    </div>
  );
}

/**
 * Step four of signup
 * @return {JSX}
 */
function SignupStepFour({active, step, handleResend}) {
  return (
    <div className='flow-large' style={{display: active ? null : 'none'}}>
      <div className='grid-flow-large text-center'>
        <h2 className='text-normal'>Verify your email</h2>
        <p className='text-gray text-lineheight-24'>
          We just sent you an email to verify your email address. Please
          use the link in the email to activate your account. The link
          will expire in 48 hours.
        </p>
      </div>
      <p className='text-gray text-center text-lineheight-24'>
        If you did not receive the email, please click the button below
        to resend another email.
      </p>
      <div className='grid-flow-small grid-center text-center'>
        <div className='flex-flow-small'>
          <ThemedButton
            color={'yellow'}
            variant={'cancel'}
            value={step}
            onClick={handleResend}
          >
            Resend Email
          </ThemedButton>
        </div>
        <p className='text-light'>
          Need help? Contact us at
          <span className='text-bold text-blue'> tasselsupport@gmail.com</span>
        </p>
      </div>
    </div>
  );
}
