import { useState } from 'react';

const useFormHandles = (initialState) => {
  const [ formData, setFormData ] = useState(initialState);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData(data => ({
      ...data,
      [name]: value
    }))
  }

  const resetForm = () => (
    setFormData(() => (
      initialState
    ))
  );

  return [formData, setFormData, handleChange, resetForm];
}

export default useFormHandles;