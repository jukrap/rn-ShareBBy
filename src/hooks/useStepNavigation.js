import {useState} from 'react';

const useStepNavigation = (navigation, setShowPostcode) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({});

  const handleNextStep = data => {
    setUserData(prevData => ({...prevData, ...data}));
    setStep(prevStep => prevStep + 1);
  };

  const handlePreviousStep = () => {
    if (step === 1) {
      navigation.navigate('Login');
    } else {
      setStep(prevStep => prevStep - 1);
    }
  };

  return {
    step,
    userData,
    handleNextStep,
    handlePreviousStep,
  };
};

export default useStepNavigation;
