import {
    InfoCircleOutlined,
    SettingOutlined,
    CameraOutlined,
    CreditCardOutlined,
} from '@ant-design/icons';
import './index.css';

export default function StepProgress({ currentStep = 0, completedSections = [], onStepClick }) {
    const steps = [
        { title: 'Basic Info', icon: InfoCircleOutlined },
        { title: 'Technical Specs', icon: SettingOutlined },
        { title: 'Photos/Videos', icon: CameraOutlined },
        { title: 'Pricing', icon: CreditCardOutlined },
    ];

    const handleStepClick = (index) => {
        if (onStepClick) onStepClick(index);
    };

    return (
        <div className="step-progress-tabs">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = completedSections.includes(index);

                return (
                    <div
                        key={index}
                        className={`step-tab ${isActive ? 'step-tab-active' : ''} ${isCompleted ? 'step-tab-completed' : ''
                            }`}
                        onClick={() => handleStepClick(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleStepClick(index);
                        }}
                    >
                        <div className="step-tab-bar" />
                        <div className="step-tab-row">
                            <Icon className="step-tab-icon" />
                            <span className="step-tab-title">{step.title}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
