import { useEffect, useState } from 'react'
import { useCategories, useCategorialQuestions } from './hooks/useCategories'
import { useDevices, useDeviceVariants, useDeviceVariantPrice } from './hooks/useDevices'
import { calculateFinalPrice } from './utils/priceListService'

export default function CategoryBrowser() {
  const { categories, loading: loadingCategories } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null)
  const [selectedDeviceVariant, setSelectedDeviceVariant] = useState<number | null>(null)
  const [questionAnswers, setQuestionAnswers] = useState<[] | null>([])
  const [questionAnswersIds, setQuestionAnswersIds] = useState<number[]>([])

  const { categorialQuestions, loading: loadingQuestions, error: questionsError } = useCategorialQuestions(selectedCategory, selectedDevice)
  const [deviceSearchTerm, setDeviceSearchTerm] = useState<string>('');
  const [debouncedDeviceSearchTerm, setDebouncedSearchTerm] = useState(deviceSearchTerm);
  const { devices, loading: loadingDevices } = useDevices(debouncedDeviceSearchTerm, selectedCategory)
  const { deviceVariants, loading: loadingDevicesVariants } = useDeviceVariants(selectedDevice)
  const { salePrice, loading: loadingFinalPrice, error: finalPriceError } = useDeviceVariantPrice(selectedCategory || 0, selectedDeviceVariant || 0, questionAnswersIds)

function handleQuestionChange(questionId, answerId, value) {
  setQuestionAnswers((prev) => ({
    ...prev,
    [questionId]: {
      answerId,
      value,
    },
  }));

  // Update answer IDs array (ensure unique per question)
  setQuestionAnswersIds((prev) => {
    const otherAnswers = prev.filter(
      (id) => Object(questionAnswers)[questionId]?.answerId !== id
    );
    return [...otherAnswers, answerId];
  });
}

  // function useCalculateFinalPrice() {
  //   // Example: calculate final price
  //   const { salePrice, loading, error } = useDeviceVariantPrice(selectedCategory || 0, selectedDeviceVariant || 0, questionAnswersIds)
  //   console.log('Final Price:', salePrice);
  // }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(deviceSearchTerm);
    }, 400); // wait 400 ms after the last keystroke

    return () => clearTimeout(timer);
  }, [deviceSearchTerm]);

  return (
    <div className="p-6 space-y-6">
      {/* Categories */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Categories</h2>
        {loadingCategories ? (
          <p>Loading categories...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-3 py-2 rounded border ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                onClick={() => {
                  setSelectedCategory(cat.id)
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Devices */}
      {selectedCategory && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Devices</h2>
          {loadingDevices ? (
            <p>Loading devices...</p>
          ) : devices.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <p>Search Device</p>
              <input
                type="text"
                placeholder="Search..."
                value={deviceSearchTerm}
                onChange={(e) => setDeviceSearchTerm(e.target.value)}
                style={{
                  padding: '10px',
                  width: '100%',
                  marginBottom: '15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                }}
              />
              {devices.map((device) => (
                <button
                  key={device.id}
                  className={`px-3 py-2 rounded border ${selectedDevice === device.id ? 'bg-green-600 text-white' : 'bg-gray-100'
                    }`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  {device.label}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <p>Search Device</p>
              <input
                type="text"
                placeholder="Search..."
                value={deviceSearchTerm}
                onChange={(e) => setDeviceSearchTerm(e.target.value)}
                style={{
                  padding: '10px',
                  width: '100%',
                  marginBottom: '15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                }}
              />
              <p>No devices found.</p>
            </div>
          )}
        </section>
      )}


      {/* Characteristic Questions */}
      {selectedCategory && selectedDevice && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Characteristic Questions</h2>
          {loadingQuestions ? (
            <p>Loading questions...</p>
          ) : questionsError ? (
            <p className="text-red-600">Error loading questions: {questionsError}</p>
          ) : categorialQuestions.length > 0 ? (
            <div>
              <div className="space-y-4">
                {questionAnswers && (<div className="mb-4">
                  <h3 className="font-medium mb-2">Your Answers:</h3>
                  <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(questionAnswers, null, 2)}</pre>
                </div>
                )
                }
                {questionAnswersIds && (<div className="mb-4">
                  <h3 className="font-medium mb-2">Your Selected Answers ID:</h3>
                  <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(questionAnswersIds, null, 2)}</pre>
                </div>
                )
                }
                {deviceVariants.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Storage Size</h3>
                    <h4>Selected Storage: {selectedDeviceVariant}</h4>
                    <ul className="list-disc list-inside">
                      {deviceVariants.map((variant) => (
                        <label key={variant.storage} className="block">
                          <input type="radio" name="question-storage" value={variant.id} className="mr-2" onChange={(e) => setSelectedDeviceVariant(e.target.value)} />
                          {variant.storage}
                        </label>
                      ))}
                    </ul>
                  </div>
                )}

                {categorialQuestions.map((question) => (
                  <div key={question.id} className="p-4 border rounded">
                    <h3 className="font-medium">{question.question}</h3>
                    {question.description && <p className="text-sm text-gray-600">{question.description}</p>}
                    <div className="mt-2">
                      {question.question_type === 'radio' && question.question_answers.map((answer) => (
                        <label key={answer.value} className="block">
                          <input type="radio" name={`question-${question.id}`} value={answer.value} className="mr-2" onChange={(e) => handleQuestionChange(question.id, answer.id, e.target.value )} />
                          {answer.value}
                        </label>
                      ))}

                      {question.question_type === 'checkbox' && question.question_answers.map((answer) => (
                        <label key={answer.value} className="block">
                          <input type="checkbox" name={`question-${question.id}`} value={answer.value} className="mr-2" onChange={(e) => handleQuestionChange(question.id, answer.id, e.target.value )} />
                          {answer.value}
                        </label>
                      ))}

                      {question.question_type === 'slider' && (
                        <div className="flex flex-col mb-4">
                          <label htmlFor={`question-${question.id}`} className="mb-1">{question.question}</label>
                          <input
                            id={`question-${question.id}`}
                            type="range"
                            min={1}
                            max={100}
                            defaultValue={50}
                            className="w-full"
                            onChange={(e) => handleQuestionChange(question.id, question.id, e.target.value )}
                          />
                          <span className="text-sm text-gray-600 mt-1">Value: <span id={`value-${question.id}`}>{}</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {salePrice > 0 ? (
                <div className="mt-6 p-4 border rounded bg-yellow-100">
                  <h3 className="text-lg font-semibold">Final Price: ${salePrice}</h3>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          ) : (
            <p>No questions found.</p>
          )}
        </section>
      )}
    </div>
  )
}