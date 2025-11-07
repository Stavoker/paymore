import { useEffect, useState } from 'react'
import { useCategories, useCategorialQuestions } from './hooks/useCategories'
import { useDevices } from './hooks/useDevices'

export default function CategoryBrowser() {
  const { categories, loading: loadingCategories } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null)

  const { categorialQuestions, loading: loadingQuestions, error: questionsError } = useCategorialQuestions(selectedCategory, selectedDevice)
  const [deviceSearchTerm, setDeviceSearchTerm] = useState<string>('');
  const [debouncedDeviceSearchTerm, setDebouncedSearchTerm] = useState(deviceSearchTerm);
  const { devices, loading: loadingDevices } = useDevices(debouncedDeviceSearchTerm, selectedCategory)

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
                className={`px-3 py-2 rounded border ${
                  selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100'
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
                  className={`px-3 py-2 rounded border ${
                    selectedDevice === device.id ? 'bg-green-600 text-white' : 'bg-gray-100'
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
            <div className="space-y-4">
              {categorialQuestions.map((question) => (
                <div key={question.id} className="p-4 border rounded">
                  <h3 className="font-medium">{question.question}</h3>
                  {question.description && <p className="text-sm text-gray-600">{question.description}</p>}
                  <div className="mt-2">
                    {question.question_type === 'radio' && question.question_answers.map((answer) => (
                      <label key={answer.value} className="block">
                        <input type="radio" name={`question-${question.id}`} value={answer.value} className="mr-2" />
                        {answer.value}
                      </label>
                    ))}

                    {question.question_type === 'checkbox' && question.question_answers.map((answer) => (
                      <label key={answer.value} className="block">
                        <input type="checkbox" name={`question-${question.id}`} value={answer.value} className="mr-2" />
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
                          onChange={(e) => console.log(`Question ${question.id} value: ${e.target.value}`)}
                        />
                        <span className="text-sm text-gray-600 mt-1">Value: <span id={`value-${question.id}`}>50</span></span>
                      </div>
                    )} 
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No questions found.</p>
          )}
        </section>
      )}
    </div>
  )
}