import {
  InfoCircleOutlined,
  SettingOutlined,
  CameraOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import "./index.css";

const STEPS = [
  { title: "Basic Info", icon: InfoCircleOutlined },
  { title: "Pricing", icon: CreditCardOutlined },
  { title: "Technical Specs", icon: SettingOutlined },
  { title: "Photos", icon: CameraOutlined },
];

export default function StepProgress({
  currentStep = 0,
  completedSections = [],
  onStepClick,
}) {
  const handleStepClick = (index) => {
    onStepClick?.(index);
  };

  return (
    <div className="step-progress-tabs">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = completedSections.includes(index);
        const className = `step-tab ${isActive ? "step-tab-active" : ""} ${isCompleted ? "step-tab-completed" : ""}`;

        return (
          <div
            key={index}
            className={className}
            onClick={() => handleStepClick(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleStepClick(index);
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
