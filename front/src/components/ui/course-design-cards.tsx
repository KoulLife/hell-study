import React from 'react';

export interface CardData {
  id: number;
  colorClass: 'green' | 'orange' | 'red' | 'blue';
  date: string;
  title: string;
  description: string;
  progressPercent: string;
  progressValue: string;
  imgSrc1?: string;
  imgAlt1?: string;
  imgSrc2?: string;
  imgAlt2?: string;
  countdownText: string;
}

interface CardProps {
  data: CardData;
}

const EllipsisIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
    <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
  </svg>
);

const AddIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const Card: React.FC<CardProps> = ({ data }) => {
  const {
    colorClass,
    date,
    title,
    description,
    progressPercent,
    progressValue,
    imgSrc1,
    imgAlt1,
    imgSrc2,
    imgAlt2,
    countdownText,
  } = data;

  return (
    <div className={`course-card ${colorClass}`}>
      <div className="course-card-header">
        <div className="course-date">{date}</div>
        <button className="course-menu-btn"><EllipsisIcon /></button>
      </div>
      <div className="course-card-body">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="course-progress">
          <div className="course-progress-labels">
            <span>Progress</span>
            <span>{progressValue}</span>
          </div>
          <div
            className="course-progress-track"
          >
            <div
              className="course-progress-bar"
              style={{ width: progressPercent }}
            />
          </div>
        </div>
      </div>
      <div className="course-card-footer">
        <ul className="course-avatars">
          {imgSrc1 && (
            <li><img src={imgSrc1} alt={imgAlt1 || 'user'} /></li>
          )}
          {imgSrc2 && (
            <li><img src={imgSrc2} alt={imgAlt2 || 'user'} /></li>
          )}
          <li>
            <button className="course-btn-add"><AddIcon /></button>
          </li>
        </ul>
        <span className="course-countdown">{countdownText}</span>
      </div>
    </div>
  );
};

export default Card;
