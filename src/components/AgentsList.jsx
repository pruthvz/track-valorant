import { useEffect, useState } from "react";
import { fetchAgents } from "../api/valorant";

export default function AgentsList() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchAgents();
      setAgents(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl font-black uppercase tracking-wider mb-4">Loading Agents...</div>
          <div className="w-32 h-1 bg-black border border-red-500/50">
            <div className="h-full bg-red-500 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
              <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-wider">
                AGENTS
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
            </div>
            <p className="text-gray-400 text-center text-lg font-light tracking-wide">
              Select an agent to view details
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {agents.map((agent) => (
              <div
                key={agent.uuid}
                onClick={() => setSelectedAgent(agent)}
                className="group relative bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden border-2 border-red-500/20 hover:border-red-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:-translate-y-2 cursor-pointer"
              >
                <div className="aspect-square flex items-center justify-center p-4 bg-gradient-to-b from-black/80 to-black relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={agent.displayIcon}
                    alt={agent.displayName}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 relative z-10 filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-3 bg-black/80 backdrop-blur-sm border-t border-red-500/20">
                  <h3 className="text-white font-bold text-sm mb-2 truncate uppercase tracking-wide">
                    {agent.displayName}
                  </h3>
                  {agent.role && (
                    <div className="flex items-center gap-2">
                      <img
                        src={agent.role.displayIcon}
                        alt={agent.role.displayName}
                        className="w-4 h-4 object-contain"
                      />
                      <span className="text-xs text-gray-400 uppercase tracking-wide truncate">
                        {agent.role.displayName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedAgent(null)}
        >
          <div 
            className="bg-black border-2 border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.3)] max-w-6xl w-full max-h-[95vh] relative animate-fade-in flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-red-500 text-2xl sm:text-3xl font-black w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-red-500/30 hover:border-red-500 bg-black/80 hover:bg-red-500/10 transition-all duration-300 z-20"
            >
              ×
            </button>

            <div className="relative z-10 p-4 sm:p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Agent Header - Compact */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0">
                {/* Agent Portrait */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  {selectedAgent.fullPortrait ? (
                    <img
                      src={selectedAgent.fullPortrait}
                      alt={selectedAgent.displayName}
                      className="w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain filter drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                    />
                  ) : (
                    <img
                      src={selectedAgent.displayIcon}
                      alt={selectedAgent.displayName}
                      className="w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain filter drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                    />
                  )}
                </div>

                {/* Agent Info - Compact */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-wider mb-1 sm:mb-2">
                    {selectedAgent.displayName}
                  </h1>
                  {selectedAgent.role && (
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <img
                        src={selectedAgent.role.displayIcon}
                        alt={selectedAgent.role.displayName}
                        className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                      />
                      <span className="text-sm sm:text-base text-red-400 font-bold uppercase tracking-wide">
                        {selectedAgent.role.displayName}
                      </span>
                    </div>
                  )}
                  {selectedAgent.description && (
                    <p className="text-gray-300 text-xs sm:text-sm leading-snug line-clamp-3">
                      {selectedAgent.description}
                    </p>
                  )}
                  
                  {/* Character Tags - Compact */}
                  {selectedAgent.characterTags && selectedAgent.characterTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedAgent.characterTags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Abilities Section - Compact and Scrollable */}
              {selectedAgent.abilities && selectedAgent.abilities.length > 0 && (
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                    <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                      ABILITIES
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-red-500/50 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {selectedAgent.abilities
                        .filter(ability => ability.slot !== 'Passive')
                        .map((ability, index) => (
                          <div
                            key={index}
                            className="bg-black/60 backdrop-blur-sm border-2 border-red-500/20 hover:border-red-500/50 transition-all duration-300 p-3 sm:p-4"
                          >
                            <div className="flex items-start gap-2 sm:gap-3 mb-2">
                              {ability.displayIcon && (
                                <img
                                  src={ability.displayIcon}
                                  alt={ability.displayName}
                                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-black text-sm sm:text-base uppercase tracking-wide mb-0.5 truncate">
                                  {ability.displayName || `Ability ${index + 1}`}
                                </h3>
                                {ability.slot && (
                                  <span className="text-[10px] sm:text-xs text-red-400 uppercase tracking-wide font-semibold">
                                    {ability.slot}
                                  </span>
                                )}
                              </div>
                            </div>
                            {ability.description && (
                              <p className="text-gray-400 text-xs sm:text-sm leading-snug line-clamp-2">
                                {ability.description}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
