#!/bin/bash

echo "🚀 Building SugarCipher for Production Web Deployment"

# Create dist directory
mkdir -p dist

# Create a professional index.html with SugarCipher branding
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SugarCipher - Intelligent Sugar Tracking & Gamification</title>
    <meta name="description" content="Track your sugar intake with AI-powered insights, gamification, and enterprise-grade security. Your intelligent companion for healthier living.">
    <meta name="keywords" content="sugar tracking, health app, gamification, AI health, diabetes management, nutrition">
    <meta name="author" content="SugarCipher">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://sugarcypher.com/">
    <meta property="og:title" content="SugarCipher - Intelligent Sugar Tracking">
    <meta property="og:description" content="Track your sugar intake with AI-powered insights and gamification.">
    <meta property="og:image" content="https://sugarcypher.com/og-image.jpg">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://sugarcypher.com/">
    <meta property="twitter:title" content="SugarCipher - Intelligent Sugar Tracking">
    <meta property="twitter:description" content="Track your sugar intake with AI-powered insights and gamification.">
    <meta property="twitter:image" content="https://sugarcypher.com/og-image.jpg">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            padding: 60px 0;
            color: white;
        }

        .logo {
            font-size: 4rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .tagline {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            font-weight: 300;
        }

        .cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 3rem;
        }

        .btn {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-block;
            backdrop-filter: blur(10px);
        }

        .btn:hover {
            background: rgba(255,255,255,0.3);
            border-color: rgba(255,255,255,0.5);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .btn.primary {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            border-color: transparent;
        }

        .btn.primary:hover {
            background: linear-gradient(45deg, #ee5a24, #ff6b6b);
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 4rem 0;
        }

        .feature {
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }

        .feature:hover {
            transform: translateY(-5px);
        }

        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .feature h3 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }

        .feature p {
            color: #666;
            line-height: 1.6;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin: 4rem 0;
            text-align: center;
            color: white;
        }

        .stat {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #ffd700;
        }

        .stat-label {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .footer {
            text-align: center;
            padding: 3rem 0;
            color: rgba(255,255,255,0.7);
            border-top: 1px solid rgba(255,255,255,0.1);
            margin-top: 4rem;
        }

        .coming-soon {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
        }

        @media (max-width: 768px) {
            .logo { font-size: 3rem; }
            .tagline { font-size: 1.2rem; }
            .cta-buttons { flex-direction: column; align-items: center; }
            .features { grid-template-columns: 1fr; }
            .stats { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo">🍬 SugarCipher</div>
            <p class="tagline">Your intelligent sugar tracking and gamification companion</p>
            
            <div class="cta-buttons">
                <a href="#features" class="btn">Learn More</a>
                <a href="#" class="btn primary" onclick="alert('Coming soon! This is a placeholder for the full app.')">
                    Launch App
                </a>
            </div>
        </header>

        <div class="coming-soon">
            <h2>🚀 Full App Coming Soon!</h2>
            <p>We're building something amazing. This is a placeholder page while we prepare the full SugarCipher experience.</p>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-number">AI</div>
                <div class="stat-label">Powered Insights</div>
            </div>
            <div class="stat">
                <div class="stat-number">🎮</div>
                <div class="stat-label">Gamified Experience</div>
            </div>
            <div class="stat">
                <div class="stat-number">🔒</div>
                <div class="stat-label">Enterprise Security</div>
            </div>
            <div class="stat">
                <div class="stat-number">📱</div>
                <div class="stat-label">Cross Platform</div>
            </div>
        </div>

        <div class="features" id="features">
            <div class="feature">
                <div class="feature-icon">🤖</div>
                <h3>AI-Powered Analysis</h3>
                <p>Advanced machine learning algorithms provide personalized insights and recommendations for your sugar intake patterns.</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🎯</div>
                <h3>Smart Goal Setting</h3>
                <p>Set personalized health goals with intelligent tracking and adaptive challenges that evolve with your progress.</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🏆</div>
                <h3>Gamification</h3>
                <p>Earn badges, complete challenges, and compete with friends in a fun, engaging health journey.</p>
            </div>
            <div class="feature">
                <div class="feature-icon">📊</div>
                <h3>Advanced Analytics</h3>
                <p>Comprehensive dashboards and reports to understand your health trends and make informed decisions.</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🔐</div>
                <h3>Enterprise Security</h3>
                <p>Bank-level encryption and security protocols ensure your health data remains private and protected.</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🌐</div>
                <h3>Cross-Platform</h3>
                <p>Seamless experience across iOS, Android, and web platforms with real-time synchronization.</p>
            </div>
        </div>

        <footer class="footer">
            <p>&copy; 2024 SugarCipher. All rights reserved.</p>
            <p>Built with ❤️ for healthier living</p>
        </footer>
    </div>

    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });

            // Add loading animation
            const features = document.querySelectorAll('.feature');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            });

            features.forEach(feature => {
                feature.style.opacity = '0';
                feature.style.transform = 'translateY(20px)';
                feature.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(feature);
            });
        });
    </script>
</body>
</html>
EOF

echo "✅ Created professional index.html"
echo "📁 Files ready in 'dist' directory"
echo ""
echo "🚀 To deploy to Netlify:"
echo "   1. Install Netlify CLI: npm install -g netlify-cli"
echo "   2. Deploy: netlify deploy --prod --dir=dist"
echo "   3. Or use Netlify dashboard with build command: npm run build:web:netlify"
echo ""
echo "🎉 Your SugarCipher landing page is ready for production!"
