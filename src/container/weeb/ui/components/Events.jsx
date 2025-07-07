import React from 'react'
import Card from '../primitives/Card';
const data = [
  {
    url: "/weeb/Dreamina.jpeg", // Wild horses
    cumbTitle: "Design Generative",
    subHeading: "Dreamina.ai 3.0",
    Title: "AI Image Generative ",
    ctaLink: "https://sfdesignweek.org/"
  },
  {
    url: "/weeb/Gemini.png", // Music concert
    cumbTitle: "Design Generative",
    subHeading: "Gemini Flash 2.5",
    Title: "AI Design Prompting",
    ctaLink: "https://uxbootcamp.com/"
  },
  {
    url: "/weeb/gptmaker.png", // Father's Day family
    cumbTitle: "AI Design Generative",
    subHeading: "GPT 4.1",
    Title: "Image Prompting ",
    ctaLink: "https://meetup.com/london-creatives"
  }
];
const EventsComponents = () => {
  return (
    <div className='relative'>
      <h1 className='text-5xl text-center font-bold text-gray-900 mb-20'>
        Choose Your Models <br/>To Make Design Interactive with AI
      </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
            {
                data.map((event, index) => {
                    return <Card title={event.Title} 
                    ctaLink={event.ctaLink} 
                    crumbTitle={event.cumbTitle}  
                    subHeading={event.subHeading}
                    url={event.url}
                    key={index}
                    />
                }) 
                
        }
        </div>
    </div>
  )
}

export default EventsComponents
