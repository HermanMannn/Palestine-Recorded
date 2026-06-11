import { createLazyFileRoute } from '@tanstack/react-router'

import Library from '@/components/Library'; 
import Navbar from '@/components/Navbar';
export const Route = createLazyFileRoute('/library')({
  component: RouteComponent,
})

function RouteComponent() {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <div className="relative flex-1 overflow-hidden">
          <Library/>

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" style="background-color: #050505; max-width: 100%; height: auto; border-radius: 4px;">
  <defs>
    <style>
      .draw {
        fill: none;
        stroke: #ffffff;
        stroke-width: 1.5;
        stroke-linecap: square;
        stroke-linejoin: miter;
        stroke-dasharray: 1;
        stroke-dashoffset: 1;
        animation: sketch forwards ease-in-out;
      }
      
      @keyframes sketch {
        100% { stroke-dashoffset: 0; }
      }

      /* Timing groups for top-to-bottom reveal */
      .g1 { animation-duration: 0.8s; animation-delay: 0.0s; }
      .g2 { animation-duration: 0.6s; animation-delay: 0.7s; }
      .g3 { animation-duration: 0.8s; animation-delay: 1.2s; }
      .g4 { animation-duration: 0.5s; animation-delay: 1.9s; }
      .g5 { animation-duration: 1.0s; animation-delay: 2.3s; }
      .g6 { animation-duration: 0.8s; animation-delay: 3.2s; }
      .g7 { animation-duration: 0.6s; animation-delay: 3.8s; }
      .g8 { animation-duration: 0.7s; animation-delay: 4.3s; }
    </style>
  </defs>

  <g id="roof">
    <path class="draw g1" pathLength="1" d="M10,140 L300,20 L590,140 Z" />
    <path class="draw g1" pathLength="1" d="M10,145 h580" />
    <path class="draw g1" pathLength="1" d="M30,132 V140 M50,123 V140 M70,115 V140 M90,107 V140 M110,99 V140 M130,90 V140 M150,82 V140 M170,74 V140 M190,66 V140 M210,57 V140 M230,49 V140 M250,41 V140 M270,32 V140 M290,24 V140 M310,24 V140 M330,32 V140 M350,41 V140 M370,49 V140 M390,57 V140 M410,66 V140 M430,74 V140 M450,82 V140 M470,90 V140 M490,99 V140 M510,107 V140 M530,115 V140 M550,123 V140 M570,132 V140" />
  </g>

  <g id="facade-lines">
    <path class="draw g2" pathLength="1" d="M10,145 h580 v655 h-580 Z" />
    <path class="draw g2" pathLength="1" d="M10,320 h580 M10,330 h580 M10,340 h580" />
    <path class="draw g2" pathLength="1" d="M10,580 h580 M10,590 h580 M10,600 h580" />
  </g>

  <g id="top-floor">
    <path class="draw g3" pathLength="1" d="M185,145 h30 v175 h-30 Z" />
    <path class="draw g3" pathLength="1" d="M385,145 h30 v175 h-30 Z" />
    
    <path class="draw g3" pathLength="1" d="M50,170 h100 v110 h-100 Z" />
    <path class="draw g3" pathLength="1" d="M60,180 h80 v90 h-80 Z" />
    <path class="draw g3" pathLength="1" d="M100,180 v90" />
    <path class="draw g3" pathLength="1" d="M60,225 h80" />
    <path class="draw g3" pathLength="1" d="M250,170 h100 v110 h-100 Z" />
    <path class="draw g3" pathLength="1" d="M260,180 h80 v90 h-80 Z" />
    <path class="draw g3" pathLength="1" d="M300,180 v90" />
    <path class="draw g3" pathLength="1" d="M260,225 h80" />
    <path class="draw g3" pathLength="1" d="M450,170 h100 v110 h-100 Z" />
    <path class="draw g3" pathLength="1" d="M460,180 h80 v90 h-80 Z" />
    <path class="draw g3" pathLength="1" d="M500,180 v90" />
    <path class="draw g3" pathLength="1" d="M460,225 h80" />
  </g>

  <g id="middle-trims">
    <path class="draw g4" pathLength="1" d="M40,390 L100,360 L160,390 Z" />
    <path class="draw g4" pathLength="1" d="M40,550 h120 v15 h-120 Z" />
    
    <path class="draw g4" pathLength="1" d="M240,390 L300,360 L360,390 Z" />
    <path class="draw g4" pathLength="1" d="M240,550 h120 v15 h-120 Z" />
    
    <path class="draw g4" pathLength="1" d="M440,390 L500,360 L560,390 Z" />
    <path class="draw g4" pathLength="1" d="M440,550 h120 v15 h-120 Z" />
  </g>

  <g id="middle-floor">
    <path class="draw g5" pathLength="1" d="M180,340 h40 v240 h-40 Z" />
    <path class="draw g5" pathLength="1" d="M190,340 v240 M210,340 v240" />
    <path class="draw g5" pathLength="1" d="M380,340 h40 v240 h-40 Z" />
    <path class="draw g5" pathLength="1" d="M390,340 v240 M410,340 v240" />

    <path class="draw g5" pathLength="1" d="M50,400 h100 v150 h-100 Z" />
    <path class="draw g5" pathLength="1" d="M60,410 h80 v130 h-80 Z" />
    <path class="draw g5" pathLength="1" d="M100,410 v130" />
    <path class="draw g5" pathLength="1" d="M60,475 h80" />
    <path class="draw g5" pathLength="1" d="M250,400 h100 v150 h-100 Z" />
    <path class="draw g5" pathLength="1" d="M260,410 h80 v130 h-80 Z" />
    <path class="draw g5" pathLength="1" d="M300,410 v130" />
    <path class="draw g5" pathLength="1" d="M260,475 h80" />
    <path class="draw g5" pathLength="1" d="M450,400 h100 v150 h-100 Z" />
    <path class="draw g5" pathLength="1" d="M460,410 h80 v130 h-80 Z" />
    <path class="draw g5" pathLength="1" d="M500,410 v130" />
    <path class="draw g5" pathLength="1" d="M460,475 h80" />
  </g>

  <g id="ground-brick">
    <path class="draw g6" pathLength="1" d="M10,620 h410 M10,640 h410 M10,660 h410 M10,680 h410 M10,700 h410 M10,720 h410 M10,740 h410 M10,760 h410 M10,780 h410" />
    <path class="draw g6" pathLength="1" d="M40,600 v20 M100,600 v20 M160,600 v20 M220,600 v20 M280,600 v20 M340,600 v20 M400,600 v20" />
    <path class="draw g6" pathLength="1" d="M10,620 v20 M70,620 v20 M130,620 v20 M190,620 v20 M250,620 v20 M310,620 v20 M370,620 v20" />
    <path class="draw g6" pathLength="1" d="M40,640 v20 M100,640 v20 M160,640 v20 M220,640 v20 M280,640 v20 M340,640 v20 M400,640 v20" />
    <path class="draw g6" pathLength="1" d="M10,660 v20 M70,660 v20 M130,660 v20 M190,660 v20 M250,660 v20 M310,660 v20 M370,660 v20" />
    <path class="draw g6" pathLength="1" d="M40,680 v20 M100,680 v20 M160,680 v20 M220,680 v20 M280,680 v20 M340,680 v20 M400,680 v20" />
    <path class="draw g6" pathLength="1" d="M10,700 v20 M70,700 v20 M130,700 v20 M190,700 v20 M250,700 v20 M310,700 v20 M370,700 v20" />
    <path class="draw g6" pathLength="1" d="M40,720 v20 M100,720 v20 M160,720 v20 M220,720 v20 M280,720 v20 M340,720 v20 M400,720 v20" />
    <path class="draw g6" pathLength="1" d="M10,740 v20 M70,740 v20 M130,740 v20 M190,740 v20 M250,740 v20 M310,740 v20 M370,740 v20" />
    <path class="draw g6" pathLength="1" d="M40,760 v20 M100,760 v20 M160,760 v20 M220,760 v20 M280,760 v20 M340,760 v20 M400,760 v20" />
    <path class="draw g6" pathLength="1" d="M10,780 v20 M70,780 v20 M130,780 v20 M190,780 v20 M250,780 v20 M310,780 v20 M370,780 v20" />
  </g>

  <rect stroke-width="1.5" x="118" y="706" width="80" height="120" rx="1" style="fill:none;stroke:rgb(255, 255, 255);color:rgb(255, 255, 255);stroke-width:1.5px;stroke-linecap:round;stroke-linejoin:round;opacity:1;font-family:&quot;Anthropic Sans&quot;, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif;font-size:16px;font-weight:400;text-anchor:start;dominant-baseline:auto"/>
  <rect stroke-width="1.0" x="123" y="711" width="70" height="110" rx="1" style="fill:none;stroke:rgb(255, 255, 255);color:rgb(255, 255, 255);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;opacity:1;font-family:&quot;Anthropic Sans&quot;, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif;font-size:16px;font-weight:400;text-anchor:start;dominant-baseline:auto"/>
  <line stroke-width="0.9" x1="158" y1="711" x2="158" y2="821" style="fill:none;stroke:rgb(255, 255, 255);color:rgb(255, 255, 255);stroke-width:0.9px;stroke-linecap:round;stroke-linejoin:round;opacity:1;font-family:&quot;Anthropic Sans&quot;, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif;font-size:16px;font-weight:400;text-anchor:start;dominant-baseline:auto"/>
  <line stroke-width="0.9" x1="146" y1="711" x2="146" y2="821" style="fill:none;stroke:rgb(255, 255, 255);color:rgb(255, 255, 255);stroke-width:0.9px;stroke-linecap:round;stroke-linejoin:round;opacity:1;font-family:&quot;Anthropic Sans&quot;, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif;font-size:16px;font-weight:400;text-anchor:start;dominant-baseline:auto"/>
  <line stroke-width="0.9" x1="170" y1="711" x2="170" y2="821" style="fill:none;stroke:rgb(255, 255, 255);color:rgb(255, 255, 255);stroke-width:0.9px;stroke-linecap:round;stroke-linejoin:round;opacity:1;font-family:&quot;Anthropic Sans&quot;, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif;font-size:16px;font-weight:400;text-anchor:start;dominant-baseline:auto"/>

  <g id="entrance">
    <path class="draw g8" pathLength="1" d="M420,610 L500,570 L580,610 Z" />
    <path class="draw g8" pathLength="1" d="M430,610 L500,575 L570,610 Z" />
    
    <path class="draw g8" pathLength="1" d="M430,620 h15 v180 h-15 Z" />
    <path class="draw g8" pathLength="1" d="M555,620 h15 v180 h-15 Z" />
    
    <path class="draw g8" pathLength="1" d="M455,620 h90 v180 h-90 Z" />
    <path class="draw g8" pathLength="1" d="M465,630 h70 v170 h-70 Z" />
    <path class="draw g8" pathLength="1" d="M500,630 v170" />
  </g>
</svg>

        </div>
      </div>
    );
  
}
