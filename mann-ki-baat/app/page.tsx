"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Trophy, Users, Target } from "lucide-react";
import MinecraftButton from "@/components/MinecraftButton";
import ResourceCard from "@/components/ResourceCard";
import ProgressBar from "@/components/ProgressBar";
import PixelArt from "@/components/PixelArt";
import MinecraftModal from "@/components/MinecraftModal";
import { useSounds } from "@/lib/sounds";
import MinecraftCloud from "@/components/MinecraftCloud";
import FloatingBlock from "@/components/FloatingBlock";
import MindfulCraftingModal from "@/components/MindfulCraftingModal";
import AnxietyAdventureModal from "@/components/AnxietyAdventureModal";
import EmotionBlocksModal from "@/components/EmotionBlocksModal";
import SquareBreathingModal from "@/components/SquareBreathingModal";
import GroundingExerciseModal from "@/components/GroundingExerciseModal";
import FocusBuildingModal from "@/components/FocusBuildingModal";

export default function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showMindfulCraftingModal, setShowMindfulCraftingModal] =
    useState(false);
  const [showAnxietyAdventureModal, setShowAnxietyAdventureModal] =
    useState(false);
  const [showEmotionBlocksModal, setShowEmotionBlocksModal] = useState(false);
  const [showSquareBreathingModal, setShowSquareBreathingModal] =
    useState(false);
  const [showGroundingExerciseModal, setShowGroundingExerciseModal] =
    useState(false);
  const [showFocusBuildingModal, setShowFocusBuildingModal] = useState(false);
  const { play } = useSounds();

  const handleStartTest = () => {
    play("game_start");
    // Navigation would happen here
    window.location.href = "/test";
  };

  const handleCardClick = (title: string) => {
    play("click");
    switch (title) {
      case "Mindful Crafting":
        setShowMindfulCraftingModal(true);
        break;
      case "Anxiety Adventure":
        setShowAnxietyAdventureModal(true);
        break;
      case "Emotion Blocks":
        setShowEmotionBlocksModal(true);
        break;
      case "Square Breathing":
        setShowSquareBreathingModal(true);
        break;
      case "Grounding 5-4-3-2-1":
        setShowGroundingExerciseModal(true);
        break;
      case "Focus Building":
        setShowFocusBuildingModal(true);
        break;
      default:
        alert(`Starting ${title}...`);
    }
  };

  const categories = [
    {
      id: "games",
      title: "Mental Health Rehabilitation Games",
      description:
        "Minecraft-themed therapeutic games designed for mental wellness",
      items: [
        {
          title: "Mindful Crafting",
          description:
            "Craft virtual items while practicing mindfulness techniques",
          category: "game" as const,
          thumbnailColor: "#5B7C3A",
          progress: 25,
          duration: "15-20 min",
          difficulty: "easy" as const,
          tags: ["Mindfulness", "Focus", "Relaxation"],
        },
        {
          title: "Anxiety Adventure",
          description:
            "Navigate through calming Minecraft worlds to manage anxiety",
          category: "game" as const,
          thumbnailColor: "#7EC0EE",
          progress: 0,
          duration: "20-30 min",
          difficulty: "medium" as const,
          tags: ["Anxiety", "Calming", "Adventure"],
        },
        {
          title: "Emotion Blocks",
          description:
            "Identify and organize emotions using block-building mechanics",
          category: "game" as const,
          thumbnailColor: "#8B7355",
          progress: 75,
          duration: "10-15 min",
          difficulty: "easy" as const,
          tags: ["Emotions", "Self-awareness", "Therapy"],
        },
      ],
    },
    {
      id: "exercises",
      title: "Mindfulness Exercises",
      description:
        "Breathing exercises and focus activities for daily practice",
      items: [
        {
          title: "Square Breathing",
          description: "4-4-4-4 breathing technique with visual guides",
          category: "exercise" as const,
          thumbnailColor: "#4A90E2",
          progress: 50,
          duration: "5-10 min",
          difficulty: "easy" as const,
          tags: ["Breathing", "Calm", "Focus"],
        },
        {
          title: "Grounding 5-4-3-2-1",
          description: "Sensory grounding exercise in virtual nature",
          category: "exercise" as const,
          thumbnailColor: "#7EC0EE",
          progress: 100,
          duration: "8-12 min",
          difficulty: "easy" as const,
          tags: ["Grounding", "Anxiety", "Present"],
        },
        {
          title: "Focus Building",
          description: "Build structures to improve concentration",
          category: "exercise" as const,
          thumbnailColor: "#5B7C3A",
          progress: 30,
          duration: "15-20 min",
          difficulty: "medium" as const,
          tags: ["Focus", "ADHD", "Productivity"],
        },
      ],
    },
    {
      id: "yoga",
      title: "Yoga for Mental Wellness",
      description: "Gentle yoga sessions for stress relief and mental clarity",
      items: [
        {
          title: "Morning Calm Flow",
          description: "Start your day with peaceful Minecraft sunrise yoga",
          category: "yoga" as const,
          thumbnailColor: "#FFD700",
          progress: 0,
          duration: "20-25 min",
          difficulty: "easy" as const,
          tags: ["Morning", "Energy", "Calm"],
        },
        {
          title: "Anxiety Relief Poses",
          description: "Specific asanas to reduce anxiety symptoms",
          category: "yoga" as const,
          thumbnailColor: "#98FB98",
          progress: 60,
          duration: "15-20 min",
          difficulty: "medium" as const,
          tags: ["Anxiety", "Stress", "Relief"],
        },
        {
          title: "Sleep Preparation",
          description: "Evening routine for better sleep quality",
          category: "yoga" as const,
          thumbnailColor: "#4B0082",
          progress: 40,
          duration: "25-30 min",
          difficulty: "hard" as const,
          tags: ["Sleep", "Relaxation", "Evening"],
        },
      ],
    },
    {
      id: "audio",
      title: "Soothing Audio & Meditation Tunes",
      description: "Minecraft-inspired calming music and meditation guides",
      items: [
        {
          title: "Forest Ambience",
          description: "Calming Minecraft forest sounds for meditation",
          category: "audio" as const,
          thumbnailColor: "#228B22",
          progress: 100,
          duration: "30-45 min",
          difficulty: "easy" as const,
          tags: ["Nature", "Meditation", "Calm"],
        },
        {
          title: "Ocean Meditation",
          description: "Gentle ocean waves with soft piano melodies",
          category: "audio" as const,
          thumbnailColor: "#1E90FF",
          progress: 80,
          duration: "20-30 min",
          difficulty: "easy" as const,
          tags: ["Ocean", "Sleep", "Meditation"],
        },
        {
          title: "Cave Serenity",
          description: "Deep cave echoes with calming drips and hums",
          category: "audio" as const,
          thumbnailColor: "#696969",
          progress: 20,
          duration: "15-20 min",
          difficulty: "medium" as const,
          tags: ["Ambient", "Focus", "Deep"],
        },
      ],
    },
  ];

  const stats = [
    { label: "Active Users", value: "10", icon: Users, color: "text-mc-green" },
    {
      label: "Sessions Completed",
      value: "10",
      icon: Trophy,
      color: "text-mc-yellow",
    },
    {
      label: "Success Rate",
      value: "100%",
      icon: Target,
      color: "text-mc-blue",
    },
    {
      label: "Avg. Improvement",
      value: "84%",
      icon: Sparkles,
      color: "text-mc-green",
    },
  ];

  return (
    <div className="relative space-y-16 overflow-hidden">
      {/* Game Modals */}
      <MindfulCraftingModal
        isOpen={showMindfulCraftingModal}
        onClose={() => setShowMindfulCraftingModal(false)}
        onStart={() => {
          alert("Starting Mindful Crafting game...");
          // Actual game start logic here
        }}
      />

      <AnxietyAdventureModal
        isOpen={showAnxietyAdventureModal}
        onClose={() => setShowAnxietyAdventureModal(false)}
        onStart={() => {
          alert("Starting Anxiety Adventure game...");
          // Actual game start logic here
        }}
      />

      <EmotionBlocksModal
        isOpen={showEmotionBlocksModal}
        onClose={() => setShowEmotionBlocksModal(false)}
        onStart={() => {
          alert("Starting Emotion Blocks game...");
          // Actual game start logic here
        }}
      />

      <SquareBreathingModal
        isOpen={showSquareBreathingModal}
        onClose={() => setShowSquareBreathingModal(false)}
        onStart={() => {
          alert("Starting Square Breathing exercise...");
          // Actual exercise start logic here
        }}
      />

      <GroundingExerciseModal
        isOpen={showGroundingExerciseModal}
        onClose={() => setShowGroundingExerciseModal(false)}
        onStart={() => {
          alert("Starting Grounding exercise...");
          // Actual exercise start logic here
        }}
      />

      <FocusBuildingModal
        isOpen={showFocusBuildingModal}
        onClose={() => setShowFocusBuildingModal(false)}
        onStart={() => {
          alert("Starting Focus Building exercise...");
          // Actual exercise start logic here
        }}
      />

      {/* Background Minecraft Clouds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <MinecraftCloud
          size="lg"
          speed="slow"
          position={{ top: "30%", right: "5%" }}
          color="white"
        />
        <MinecraftCloud
          size="md"
          speed="medium"
          position={{ top: "20%", right: "15%" }}
          color="gray-200"
        />
        <MinecraftCloud
          size="sm"
          speed="fast"
          position={{ top: "40%", left: "20%" }}
          color="white"
        />
        <MinecraftCloud
          size="xl"
          speed="very-slow"
          position={{ bottom: "30%", right: "5%" }}
          color="gray-100"
        />
        <MinecraftCloud
          size="md"
          speed="slow"
          position={{ bottom: "20%", left: "10%" }}
          color="white"
        />
      </div>

      {/* Floating Minecraft Blocks */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingBlock
          type="dirt"
          size="md"
          position={{ top: "15%", right: "10%" }}
          rotationSpeed="slow"
          floatSpeed="medium"
        />
        <FloatingBlock
          type="grass"
          size="sm"
          position={{ top: "30%", left: "8%" }}
          rotationSpeed="fast"
          floatSpeed="slow"
        />
        <FloatingBlock
          type="stone"
          size="lg"
          position={{ bottom: "25%", right: "25%" }}
          rotationSpeed="medium"
          floatSpeed="slow"
        />
        <FloatingBlock
          type="wood"
          size="md"
          position={{ bottom: "35%", left: "15%" }}
          rotationSpeed="slow"
          floatSpeed="fast"
        />
        <FloatingBlock
          type="diamond"
          size="sm"
          position={{ top: "60%", right: "15%" }}
          rotationSpeed="fast"
          floatSpeed="medium"
        />
      </div>

      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(90deg, #5B7C3A 1px, transparent 1px),
              linear-gradient(0deg, #5B7C3A 1px, transparent 1px)
            `,
              backgroundSize: "32px 32px",
              backgroundPosition: "center center",
            }}
          />
        </div>
      </div>

      {/* Welcome Modal */}
      <MinecraftModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        title="Welcome to Mann ki Baat!"
        type="success"
        confirmText="Start Journey"
        onConfirm={() => {
          play("game_start");
          setShowWelcomeModal(false);
        }}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-center my-4">
            <PixelArt type="heart" size={80} animated />
          </div>

          <div className="text-center space-y-3">
            <h3 className="font-minecraft-bold text-2xl text-gray-800">
              Aapka mann aapka saathi
            </h3>

            <p className="text-gray-600">
              Welcome to your Minecraft-themed mental wellness journey! Our
              gamified platform combines therapy with the familiar, comforting
              world of Minecraft to help you build a healthier mind.
            </p>

            <div className="bg-gradient-to-r from-mc-green/20 to-mc-blue/20 border-2 border-mc-green p-4 rounded">
              <h4 className="font-minecraft-bold text-mc-green mb-2">
                🎮 How it works:
              </h4>
              <ul className="text-left space-y-1 text-sm text-gray-700">
                <li>• Complete assessments to understand your mental state</li>
                <li>
                  • Play therapeutic games designed by mental health experts
                </li>
                <li>• Track your progress with Minecraft-style achievements</li>
                <li>• Join a supportive community of fellow travelers</li>
              </ul>
            </div>

            <div className="pt-4">
              <div className="font-minecraft text-gray-500 text-sm">
                Ready to build a better you?
              </div>
            </div>
          </div>
        </div>
      </MinecraftModal>

      {/* Hero Section */}
      <section className="relative text-center py-12 md:py-20 z-10">
        {/* Decorative Corner Blocks */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-mc-green opacity-20"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-mc-blue opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-mc-yellow opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-mc-brown opacity-20"></div>

        {/* Block Pattern Background */}
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-mc-green/30 to-transparent transform rotate-45"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tl from-mc-blue/30 to-transparent transform -rotate-45"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 z-10">
          {/* Logo Animation */}
          <div className="mb-8 animate-pulse-slow">
            <div className="inline-block p-4 border-8 border-black bg-gradient-to-r from-mc-green via-mc-blue to-mc-yellow relative">
              {/* Decorative corners */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-mc-green border-2 border-black"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-mc-blue border-2 border-black"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-mc-yellow border-2 border-black"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-mc-brown border-2 border-black"></div>

              <PixelArt type="brain" size={100} animated />
            </div>
          </div>

          {/* Title with Block Effect */}
          <div className="mb-6 relative">
            <div className="inline-block border-8 border-black bg-white/95 px-8 py-6 mb-4 relative transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              {/* 3D Effect */}
              <div className="absolute -top-2 -left-2 w-full h-full border-4 border-black bg-mc-green/20 -z-10"></div>

              <h1 className="font-minecraft-bold text-4xl md:text-6xl mb-4 relative">
                <span className="text-mc-green drop-shadow-md">Mann</span>{" "}
                <span className="text-mc-brown drop-shadow-md">ki</span>{" "}
                <span className="text-mc-blue drop-shadow-md">Baat</span>
              </h1>
              <p className="font-minecraft text-2xl text-mc-dark-brown">
                Aapka mann aapka saathi
              </p>
            </div>
          </div>

          {/* CTA Section with Block Design */}
          <div className="mb-10 relative">
            <div className="inline-block bg-gradient-to-b from-gray-100 to-white border-4 border-black p-4 mb-6 relative">
              <div className="absolute -inset-1 border-2 border-mc-green/30 -z-10"></div>
              <p className="text-xl font-semibold text-gray-800">
                Test your mental health now
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="animate-pulse-glow relative">
                {/* Button Glow Effect */}
                <div className="absolute -inset-2 bg-mc-green/20 blur-lg rounded-lg animate-pulse"></div>
                <MinecraftButton
                  onClick={handleStartTest}
                  variant="success"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="relative"
                >
                  Start Test
                </MinecraftButton>
              </div>

              <MinecraftButton
                variant="secondary"
                size="lg"
                onClick={() => {
                  play("click");
                  document
                    .getElementById("games")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="border-double border-4"
              >
                Explore Games
              </MinecraftButton>
            </div>
          </div>

          {/* Stats Section with Block Design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 relative">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-mc-green via-mc-blue to-mc-yellow transform -translate-y-1/2 opacity-20 hidden md:block"></div>

            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-b from-white to-gray-100 border-4 border-black p-4 relative group hover:scale-105 transition-transform duration-300 z-10"
                >
                  {/* Hover Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-mc-green transition-colors duration-300"></div>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon
                      className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                    />
                    <span className="font-minecraft text-gray-600 text-sm">
                      {stat.label}
                    </span>
                  </div>
                  <div className="font-minecraft-bold text-2xl md:text-3xl text-gray-800">
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Stats with Block Style */}
      <section className="container mx-auto px-4 relative z-10">
        <div className="bg-gradient-to-r from-mc-brown to-mc-dark-brown border-8 border-black relative p-6">
          {/* Decorative Blocks */}
          <div className="absolute -top-3 left-1/4 w-6 h-6 bg-mc-green border-2 border-black transform rotate-45"></div>
          <div className="absolute -top-3 right-1/4 w-6 h-6 bg-mc-blue border-2 border-black transform rotate-45"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center relative group">
              <div className="absolute -left-2 top-1/2 w-4 h-4 bg-mc-green border border-black transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="font-minecraft-bold text-3xl text-white mb-2">
                3
              </div>
              <div className="font-minecraft text-white/80">Simple Steps</div>
            </div>
            <div className="text-center relative group">
              <div className="absolute -left-2 top-1/2 w-4 h-4 bg-mc-blue border border-black transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="font-minecraft-bold text-3xl text-white mb-2">
                24/7
              </div>
              <div className="font-minecraft text-white/80">
                Available Support
              </div>
            </div>
            <div className="text-center relative group">
              <div className="absolute -left-2 top-1/2 w-4 h-4 bg-mc-yellow border border-black transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="font-minecraft-bold text-3xl text-white mb-2">
                100%
              </div>
              <div className="font-minecraft text-white/80">Confidential</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Sections with Enhanced Background */}
      {categories.map((category) => (
        <section
          key={category.id}
          id={category.id}
          className="container mx-auto px-4 relative z-10"
        >
          {/* Section Background Pattern */}
          <div className="absolute inset-0 opacity-5 z-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-mc-green/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-mc-blue/10 to-transparent"></div>
          </div>

          <div className="relative mb-8 z-10">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-4 h-12 bg-gradient-to-b from-mc-green to-mc-dark-green border-2 border-black"></div>
              <h2 className="font-minecraft-bold text-3xl text-gray-800">
                {category.title}
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-3xl">
              {category.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {category.items.map((item, index) => (
              <div key={index} className="relative group">
                {/* Card Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-mc-green/20 via-mc-blue/20 to-mc-yellow/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ResourceCard
                  key={index}
                  title={item.title}
                  description={item.description}
                  category={item.category}
                  thumbnailColor={item.thumbnailColor}
                  progress={item.progress}
                  duration={item.duration}
                  difficulty={item.difficulty}
                  tags={item.tags}
                  onStart={() => handleCardClick(item.title)}
                  // className="relative"
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Final CTA with Enhanced Design */}
      <section className="container mx-auto px-4 relative z-10">
        <div className="relative overflow-hidden border-8 border-black transform hover:scale-[1.01] transition-transform duration-300">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                linear-gradient(90deg, #000 1px, transparent 1px),
                linear-gradient(0deg, #000 1px, transparent 1px)
              `,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* Main Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-mc-green via-mc-blue to-mc-yellow opacity-90"></div>

          {/* Animated Blocks */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-mc-green border-4 border-black animate-bounce"></div>
          <div
            className="absolute top-4 right-4 w-8 h-8 bg-mc-blue border-4 border-black animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="absolute bottom-4 left-4 w-8 h-8 bg-mc-yellow border-4 border-black animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="absolute bottom-4 right-4 w-8 h-8 bg-mc-brown border-4 border-black animate-bounce"
            style={{ animationDelay: "0.6s" }}
          ></div>

          {/* Content */}
          <div className="relative p-8 md:p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 inline-block border-4 border-white/30 p-4 bg-black/10">
                <h2 className="font-minecraft-bold text-3xl md:text-4xl text-white mb-4">
                  Ready to Begin Your Wellness Journey?
                </h2>
              </div>

              <p className="text-white/90 mb-8 text-lg">
                Join thousands who have found peace and balance through our
                gamified mental health platform. Your journey to better mental
                health starts with a single click.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-mc-green to-mc-blue rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                  <MinecraftButton
                    href="/test"
                    variant="success"
                    size="lg"
                    onClick={() => play("game_start")}
                    className="relative border-double border-4"
                  >
                    Start Assessment Now
                  </MinecraftButton>
                </div>

                <MinecraftButton
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    play("click");
                    alert("Coming soon: Community features!");
                  }}
                  className="border-dashed border-4"
                >
                  Join Community
                </MinecraftButton>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 relative">
                {/* Decorative Pixel Art */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 bg-gradient-to-r from-mc-green to-mc-blue border-2 border-white"></div>
                </div>
                <p className="text-white/70 text-sm">
                  All data is processed securely and anonymously. Your privacy
                  is our priority.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
