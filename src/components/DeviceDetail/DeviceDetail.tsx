import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CategorialQuestions, getAnswerByValue } from '../../services/categoryService';
import { DeviceVariant } from '../../types/category';
import Button from '../Button';
import ButtonRadio from '../ButtonRadio';
import Checkbox from '../Inputs/Checkbox';
import css from './DeviceDetail.module.css';

interface CategorialQuestionWithAnswers extends CategorialQuestions {
  question_answers: Array<{
    id: number;
    value: string;
  }>;
}

interface DeviceDetailProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  handleQuestionChange: (questionId: number, answerId: number, value: string) => void;
  currentSelectedDevice: any;
  categorialQuestions: CategorialQuestionWithAnswers[];
  deviceVariants: DeviceVariant[];
  setSelectedDeviceVariant: React.Dispatch<React.SetStateAction<number | null>>;
  handleOnSubmit: () => Promise<{ selectedCategory: number | null; selectedDevice: number | null; selectedDeviceVariant: number | null; questionAnswersIds: number[]; sale_price: number | 0; deviceName: string | undefined }>;
}

// Unified state type for all question answers
type QuestionAnswersState = {
  storage?: string | number;
  batteryHealth?: number;
  [key: string]: string | number | boolean | undefined;
};

const DeviceDetail: React.FC<DeviceDetailProps> = ({
  currentSelectedDevice,
  step,
  setStep,
  handleQuestionChange,
  categorialQuestions,
  deviceVariants,
  setSelectedDeviceVariant,
  handleOnSubmit
}) => {
  const navigate = useNavigate();
  const { brand } = useParams();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phoneUnlocked, setPhoneUnlocked] = useState<boolean>(true);
  // Unified state for all question answers
  const [answers, setAnswers] = useState<QuestionAnswersState>({
    storage: currentSelectedDevice?.storage || '',
  });

  const getQuestionsForStep = (stepNumber: number) => {
    if (stepNumber === 2) {
      return categorialQuestions.filter(q => !q.question.toLowerCase().includes('condition'));
    }
    if (stepNumber === 3) {
      return categorialQuestions.filter(q => q.question.toLowerCase().includes('condition'));
    }
    return [];
  };

  const handleDebouncedChange = ({
      question_id,
      value,
      questionType,
    }: {
      question_id: number;   // adjust type to match your actual structure
      value: string | number;
      questionType: string;
    }) => {
      // Cancel previous timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Delay callback
      timeoutRef.current = setTimeout(() => {
        handleAnswerChange(
          question_id,
          question_id,
          value,
          questionType
        );
      }, 500); // <-- delay in ms
    };

  // Unified onChange handler for all question types
  const handleAnswerChange = (
    questionId: number,
    answerId: number,
    value: string | number,
    questionType?: string,
    answerValue?: string,
    questionName?: string,
  ) => {
    const normalizedQuestionName = questionName ? questionName.toLowerCase().replace(/\s+/g, '_') : '';

    setAnswers(prev => {
      const newAnswers = { ...prev };

      if (questionType === 'storage') {
        // Handle storage selection
        const newValue = value === prev.storage ? '' : value;
        newAnswers.storage = newValue;
        // Find selected variant and pass to parent component
        const selectedVariant = deviceVariants.find(variant => variant.label === newValue);
        if (selectedVariant && newValue) {
          setSelectedDeviceVariant(selectedVariant.id);
          // handleQuestionChange(0, selectedVariant.id, newValue.toString());
        } else {
          setSelectedDeviceVariant(null);
        }
      } else if (questionType === 'range' || questionType === 'slider') {
        newAnswers[`question_${questionId}`] = value;
        getAnswerByValue(Number(value), questionId).then(data => {
          if (data) {
            console.log("Slider value:", data.id, questionId);
            handleQuestionChange(questionId, data.id, value.toString());
          }
        });
      } else if (questionType === 'radio' || questionType === 'single_choice') {
        const newValue = value === prev[`question_${questionId}`] ? '' : value;
        newAnswers[`question_${questionId}`] = newValue;
        if (newValue) {
          handleQuestionChange(questionId, answerId, value.toString());
        }
      } else if (questionType === 'checkbox' || questionType === 'multiple_choice') {
        if (normalizedQuestionName && answerValue) {
          // Create unique key combining question name and answer value
          const uniqueKey = `${normalizedQuestionName}_${answerValue.toLowerCase().replace(/\s+/g, '_')}`;
          const currentValue = prev[uniqueKey] || false;

          // Find the question to get all possible answers
          const question = categorialQuestions.find(q => q.id === questionId);

          // Clear all answers for this question first
          if (question) {
            question.question_answers.forEach(ans => {
              const ansKey = `${normalizedQuestionName}_${ans.value.toLowerCase().replace(/\s+/g, '_')}`;
              newAnswers[ansKey] = false;
            });
          }

          // Set the selected answer (toggle off if already selected)
          newAnswers[uniqueKey] = !currentValue;

          if (!currentValue) {
            handleQuestionChange(questionId, answerId, answerValue);
          }
        }

        if ("phone_&_carrier_unlocked_" === normalizedQuestionName && answerValue === "No") {
          setPhoneUnlocked(false);
        }else{
          setPhoneUnlocked(true);
        }
      } else {
        const question = categorialQuestions.find(q => q.id === questionId);
        if (question && question.question_answers.length > 0) {
          if (answerValue) {
            const currentValue = prev[answerValue] || false;
            newAnswers[answerValue] = !currentValue;
            handleQuestionChange(questionId, answerId, answerValue);
          } else {
            const newValue = value === prev[`question_${questionId}`] ? '' : value;
            newAnswers[`question_${questionId}`] = newValue;
            if (newValue) {
              handleQuestionChange(questionId, answerId, value.toString());
            }
          }
        }
      }

      return newAnswers;
    });
  };

  const isFormValid = () => {
    if (step === 2) {
      const step2Questions = getQuestionsForStep(2);

      if (step2Questions.length === 0 && variantsAvailable.length === 0) {
        return true;
      }

      // Check storage if variants exist
      if (variantsAvailable.length > 0 && !Boolean(answers.storage)) {
        return false;
      }

      // Validate each question dynamically
      for (const question of step2Questions) {
        const questionType = question.question_type?.toLowerCase() || '';

        // Skip optional questions (like charger included)
        if (question.question.toLowerCase().includes('charger included')) {
          continue;
        }

        // For range/slider types, they usually have default values, so skip validation
        if (questionType === 'range' || questionType === 'slider') {
          continue;
        }

        // For radio/single_choice, check if question has an answer
        if (questionType === 'radio' || questionType === 'single_choice') {
          if (!Boolean(answers[`question_${question.id}`])) {
            return false;
          }
        }
        // For checkbox/multiple_choice, check if at least one answer is selected
        else if (questionType === 'checkbox' || questionType === 'multiple_choice') {
          const normalizedQuestionName = question.question.toLowerCase().replace(/\s+/g, '_');
          const hasAnswer = question.question_answers.some(answer => {
            const uniqueKey = `${normalizedQuestionName}_${answer.value.toLowerCase().replace(/\s+/g, '_')}`;
            return answers[uniqueKey] === true;
          });
          if (!hasAnswer) {
            return false;
          }
        }
        // For unknown types, check if question has an answer (default to single choice behavior)
        else {
          const hasAnswer = question.question_answers.some(answer => answers[answer.value] === true || answers[`question_${question.id}`]);
          if (question.question_answers.length > 0 && !hasAnswer) {
            return false;
          }
        }
      }

      return true;
    }

    if (step === 3) {
      const step3Questions = getQuestionsForStep(3);

      if (step3Questions.length === 0) {
        return true;
      }

      // Check if condition question is answered
      for (const question of step3Questions) {
        if (!Boolean(answers[`question_${question.id}`])) {
          return false;
        }
      }

      return true;
    }

    return true;
  };
  const parseStorageSize = (storage: string): number => {
    if (!storage) return 0;

    const numericValue = parseFloat(storage);
    if (isNaN(numericValue)) return 0;

    const upperStorage = storage.toUpperCase();

    if (upperStorage.includes('TB')) {
      return numericValue * 1024; // Convert TB to GB for comparison
    } else if (upperStorage.includes('GB')) {
      return numericValue;
    } else {
      return numericValue; // Assume GB if no unit specified
    }
  };

  const variantsAvailable: string[] =
    (deviceVariants || [])
      .map((variant: DeviceVariant) => variant?.label)
      .filter(Boolean) // Remove null/undefined values
      ?.sort((a: string, b: string) => {
        // Parse storage with units (GB, TB) for proper sorting
        const aSize = parseStorageSize(a);
        const bSize = parseStorageSize(b);
        return aSize - bSize;
      }) || [];

  return (
    <div>
      <div className={css.wrapperDeviceHeader}>
        {currentSelectedDevice?.device_image && (
          <img width={123} height={123} src={currentSelectedDevice?.device_image} alt={currentSelectedDevice?.label} />
        )}
        <div className={css.wrapperDeviceInfo}>
          <h1 className={css.deviceLabel}>{currentSelectedDevice?.label}</h1>
          <Button onClick={() => navigate('/category')} colorButton={'green'}>
            Change item
          </Button>
        </div>
      </div>

      <>
        {step === 2 && (
          <div className={css.wrapperStep}>
            {/* Variant section with order */}
            {deviceVariants && variantsAvailable.length > 0 && (
              <div className={css.storageSection}>
                <p className={css.title}>Select Your Variant</p>
                <div className={css.wrapperRadioBtn}>
                  <ButtonRadio
                    options={variantsAvailable}
                    value={answers.storage || ''}
                    onChange={value => handleAnswerChange(0, 0, value, 'storage')}
                  />
                </div>
              </div>
            )}

            {getQuestionsForStep(2).map(question => {
              const questionType = question.question_type?.toLowerCase() || '';

              return (
                <div key={question.id} className={css.wrapperQuestion} data-type={questionType || 'other'}>
                  <p className={css.title}>{question.question}</p>

                  {/* Render based on question_type */}
                  {questionType === 'range' || questionType === 'slider' ? (
                    <div className={css.wrapperSlider}>
                      <div className={css.sliderContainer}>
                        <input
                          className={css.batterySlider}
                          type='range'
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setAnswers((prev) => ({
                              ...prev,
                              [`question_${question.id}`]: v,
                            }));
                            handleDebouncedChange({
                              question_id: question.id,
                              value: v,
                              questionType,
                            });
                          }}
                          min='0'
                          max='100'
                          value={Number(answers[`question_${question.id}`]) || 100}
                          style={{
                            background: `linear-gradient(to right, #45B549 0%, #45B549 ${Number(answers[`question_${question.id}`]) || 100}%, #E0E0E0 ${Number(answers[`question_${question.id}`]) || 74}%, #E0E0E0 100%)`,
                          }}
                        />
                      </div>
                      <p className={css.currentText}>Current: {Number(answers[`question_${question.id}`]) || 100}%</p>
                    </div>
                  ) : questionType === 'radio' || questionType === 'single_choice' ? (
                    <div className={css.wrapperBntRadio}>
                      {question.question_answers.length > 0 && (
                        <ButtonRadio
                          options={question.question_answers.map(answer => answer.value)}
                          value={
                            typeof answers[`question_${question.id}`] === 'string' || typeof answers[`question_${question.id}`] === 'number'
                              ? (answers[`question_${question.id}`] as string | number)
                              : ''
                          }
                          onChange={value => {
                            const selectedAnswer = question.question_answers.find(answer => answer.value === value);
                            if (selectedAnswer) {
                              handleAnswerChange(question.id, selectedAnswer.id, value, questionType);
                            }
                          }}
                        />
                      )}
                    </div>
                  ) : questionType === 'checkbox' || questionType === 'multiple_choice' || question.question_answers.length > 1 ? (
                    <div
                      className={
                        question.question_answers.some(a => ['Yes', 'No'].includes(a.value))
                          ? css.wrapperCheckboxRadio
                          : css.wrapperCheckbox
                      }
                    >
                      {question.question_answers
                        .sort((a, b) => {
                          const hasYesNo = question.question_answers.some(ans => ['Yes', 'No'].includes(ans.value));
                          if (hasYesNo) {
                            if (a.value === 'Yes') return -1;
                            if (b.value === 'Yes') return 1;
                          }
                          return 0;
                        })
                        .map(answer => {
                          const normalizedQuestionName = question.question.toLowerCase().replace(/\s+/g, '_');
                          const uniqueKey = `${normalizedQuestionName}_${answer.value.toLowerCase().replace(/\s+/g, '_')}`;
                          return (
                            <div key={answer.id} className={!['Yes', 'No'].includes(answer.value) ? css.wrapperCheckbox : ''}>
                              <Checkbox
                                radioCheckbox={['Yes', 'No'].includes(answer.value)}
                                label={answer.value}
                                checked={Boolean(answers[uniqueKey]) || false}
                                onChange={() =>
                                  handleAnswerChange(
                                    question.id,
                                    answer.id,
                                    answer.value,
                                    questionType || 'checkbox',
                                    answer.value,
                                    question.question,
                                  )
                                }
                              />
                            </div>
                          );
                        })}
                    </div>
                  ) : question.question_answers.length === 1 ? (
                    // Single answer - render as checkbox for yes/no or radio for other
                    <div className={css.wrapperCheckbox}>
                      <Checkbox
                        label={question.question_answers[0].value}
                        checked={Boolean(answers[question.question_answers[0].value]) || false}
                        onChange={() =>
                          handleAnswerChange(
                            question.id,
                            question.question_answers[0].id,
                            question.question_answers[0].value,
                            questionType || 'checkbox',
                            question.question_answers[0].value,
                          )
                        }
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {step === 3 && getQuestionsForStep(3).length > 0 && (
          <>
            {getQuestionsForStep(3).map(question => (
              <div key={question.id}>
                <p className={css.title}>{question.question}</p>
                {question.description && <p className={css.description}>{question.description}</p>}
                <div className={css.wrapperBntRadio}>
                  {question.question_answers.length > 0 && (
                    <ButtonRadio
                      options={question.question_answers.map(answer => answer.value)}
                      value={
                        typeof answers[`question_${question.id}`] === 'string' || typeof answers[`question_${question.id}`] === 'number'
                          ? (answers[`question_${question.id}`] as string | number)
                          : ''
                      }
                      onChange={value => {
                        const selectedAnswer = question.question_answers.find(answer => answer.value === value);
                        if (selectedAnswer) {
                          handleAnswerChange(question.id, selectedAnswer.id, value, 'radio');
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </>
      { !phoneUnlocked && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            Note: Your phone must be unlocked to proceed.
          </div>
        )}
      <div className='wrapper-btn-step' style={{ marginTop: '30px' }}>

        <Button
          onClick={() => {
            if (step === 2) {
              setStep(prev => prev - 1);
              navigate(`/category/${brand}`);
              return;
            }

            if (step === 3) {
              setStep(prev => prev - 1);
            }
          }}
        >
          <svg className={'arrow-icon'} width={17} height={16}>
            <use href='/img/sprite-icon.svg#arrow-next-back' />
          </svg>
          Go back
        </Button>
        <Button
          onClick={async () => {
            if (step === 2) {
              setStep(prev => prev + 1);
              return;
            }
            var { selectedCategory, selectedDevice, selectedDeviceVariant, questionAnswersIds, sale_price, deviceName } = await handleOnSubmit();
            console.log('Final price calculated:', sale_price);
            console.log('Navigating to /summary with salePrice:', sale_price);
            navigate('/summary', { state: { selectedCategoryId: selectedCategory,
                                            selectedDeviceId: selectedDevice,
                                            selectedDeviceVariantId: selectedDeviceVariant,
                                            questionAnswersIds: questionAnswersIds,
                                            salePrice: sale_price,
                                            deviceName: deviceName
                                           } 
                                  });
          }}
          disabled={!isFormValid() || !phoneUnlocked}
          active={isFormValid() && phoneUnlocked}
        >
          Continue
          <svg className={'arrow-icon next'} width={17} height={16}>
            <use href='/img/sprite-icon.svg#arrow-next-back' />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default DeviceDetail;
