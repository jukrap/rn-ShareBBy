import {useState} from 'react';

const useStepNavigation = navigation => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({}); // 사용자 데이터를 저장할 상태 추가

  const handleNextStep = data => {
    // 다음 스텝으로 이동하는 함수
    setUserData(prevData => ({...prevData, ...data})); // 입력한 데이터를 저장
    setStep(prevStep => prevStep + 1); // 다음 단계로 이동
  };

  const handlePreviousStep = () => {
    // 이전 스텝으로 이동하는 함수
    if (step === 1) {
      navigation.navigate('Login'); // 첫 번째 스텝에서 이전으로 가면 로그인 화면으로 이동
    } else {
      setStep(prevStep => prevStep - 1); // 이전 단계로 이동
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
