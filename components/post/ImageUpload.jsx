import { useState } from 'react';

export default function ImageUpload({ multiple = false, maxFiles = 5, onChange }) {
  const [preview, setPreview] = useState([]); // array of objects { url, file }

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (!multiple && files.length > 1) {
      alert('Please select only one file');
      return;
    }
    if (files.length > maxFiles) {
      alert(`Please select no more than ${maxFiles} files`);
      return;
    }

    // Update the file state
    onChange(files);

    // Create previews
    const previews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview((prev) => [
          ...prev,
          { url: reader.result, file }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    onChange((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />
      {preview.length > 0 && (
        <div className="space-y-4">
          {preview.map(({ url, file }, index) => (
            <div key={index} className="flex items-center space-x-4">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
