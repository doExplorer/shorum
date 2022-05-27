import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import Step1 from './Step1';
import Step2 from './Step2';

import './style.less';

const CreatePage = observer(function () {
    const [step, setStep] = useState(1);

    const nextStep = () => {
        setStep(step + 1);
    };

    const previousStep = () => {
        const newStep = Math.max(step - 1, 1);
        setStep(newStep);
    };

    return (
        <Choose>
            <When condition={step === 2}>
                <Step2 onPrevious={previousStep} />
            </When>
            <Otherwise>
                <Step1 onNext={nextStep} />
            </Otherwise>
        </Choose>
    );
});

export default CreatePage;
