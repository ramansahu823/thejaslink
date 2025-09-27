import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function SignIn() {
  const navigate = useNavigate();
  const { role } = useParams();
  const { state, actions } = useApp();
  const t = useTranslation(state.lang);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    id: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      id: formData.id.trim(),
      role: role
    };
    actions.setUser(user);
    navigate('/dashboard');
  };

  const handleGoToSignUp = () => {
    navigate(`/${role}-signup`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const titleKey = role === 'doctor' ? 'signInTitleDoctor' : 'signInTitlePatient';

  return (
    <section className="min-h-[calc(100vh-4rem)] grid place-items-center py-10">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl soft-shadow border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-6 sm:p-8">
          <button 
            onClick={handleBackToHome}
            className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white mb-4 inline-flex items-center gap-2 focus-ring"
          >
            <span>←</span>
            <span>{t('back')}</span>
          </button>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">
            {t(titleKey)}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="name">
                {t('name')}
              </label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                required 
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('name')} 
                className="w-full px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus-ring"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1" htmlFor="email">
                {t('email')}
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('email')} 
                className="w-full px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus-ring"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1" htmlFor="id">
                {t('id')}
              </label>
              <input 
                id="id" 
                name="id" 
                type="text" 
                value={formData.id}
                onChange={handleInputChange}
                placeholder={t('id')} 
                className="w-full px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus-ring"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                type="submit" 
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-semibold focus-ring"
              >
                <span>{t('access')}</span>
              </button>
              
              <div className="sm:ml-auto text-sm flex items-center gap-2">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {t('noAccount')}
                </span>
                <button 
                  type="button"
                  onClick={handleGoToSignUp}
                  className="text-brand-700 dark:text-brand-300 font-semibold hover:underline cursor-pointer"
                >
                  {t('signUp')}
                </button>
              </div>
            </div>
          </form>
        </div>""
      </div>
    </section>
  );
}
