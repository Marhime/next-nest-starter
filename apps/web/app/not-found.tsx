import React from 'react';
import { getTranslations } from 'next-intl/server';

const NotFoundPage = async () => {
  const t = await getTranslations('NotFound');

  return (
    <html>
      <body>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </body>
    </html>
  );
};

export default NotFoundPage;
