import { useNavigate } from 'react-router-dom';
import Hero from '@/components/ui/animated-shader-hero';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Hero
      logoSrc="/logo.png"
      trustBadge={{
        text: "지옥에서 단련된 자만이 정상에 오른다",
        icons: ["🔥"],
      }}
      headline={{
        line1: "공부를 불태워라",
        line2: "Hell Study",
      }}
      subtitle="작심삼일은 끝났다. 불꽃처럼 타오르는 집중력으로 목표를 향해 돌진하라. 지옥 같은 훈련이 천국 같은 결과를 만든다."
      buttons={{
        primary: {
          text: "지금 시작하기",
          onClick: () => navigate('/login'),
        },
      }}
    />
  );
};

export default HomePage;
