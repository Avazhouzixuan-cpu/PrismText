# PrismText

A Gemini 3–Based Cross-Cultural Semantic Alignment and Risk Decision System

## Overview

PrismText is a powerful Chrome extension that helps you communicate effectively across cultural boundaries. It uses Google's Gemini 3 AI to analyze, calibrate, and optimize your messages for different cultural contexts, ensuring your communication is culturally appropriate and impactful.

## Features

### Core Capabilities

- **Cross-Cultural Semantic Calibration**: Automatically adapts your messages to match cultural expectations and communication styles
- **Real-Time Calibration**: Dynamic sliders allow you to fine-tune communication parameters in real-time
- **Intent Detection**: Advanced intent analysis to understand the purpose and tone of your message
- **Cultural Reception Radar**: Visual representation of how your message will be perceived across different cultural dimensions
- **Audience Inner Monologue**: Simulates how your recipient might interpret your message
- **Multi-Country Support**: Optimized for 12+ countries across different regions

### Advanced Analysis Modules

- **Intent Detector V2**: Multi-level intent scoring with emotion detection and conflict identification
- **Cultural Analyzer V2**: Deep cultural context analysis based on Hofstede's cultural dimensions
- **Tone Calibrator V2**: Sophisticated tone adjustment for different communication styles
- **Contextual Intelligence**: Email thread awareness and communication history analysis
- **Semantic Analyzer V3**: Advanced semantic analysis and similarity detection
- **Entity Recognizer V3**: Named entity recognition for better context understanding
- **Language Detector V3**: Automatic language detection and analysis
- **Sentiment Analyzer V3**: Aspect-based sentiment analysis

### Dynamic Calibration Controls

Adjust your message with four key parameters:

1. **Power Distance (Hierarchy)**: Control the formality level from informal to formal
2. **Emotional Saturation**: Adjust emotional warmth from cold to warm
3. **Urgency Level**: Set the priority level from low pressure to high priority
4. **Directness**: Toggle between implicit and explicit communication styles

## Installation

### Prerequisites

- Google Chrome browser (or Chromium-based browser)
- A Google Gemini API key (get one free at [ai.google.dev](https://ai.google.dev))

### Setup Steps

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd PrismText
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the PrismText directory

4. **Configure API Key**
   - Click on the PrismText extension icon
   - Enter your Gemini API key in the quick setup prompt
   - Or go to Settings → API Settings for permanent configuration

## Usage

### Basic Workflow

1. **Open PrismText**: Click the extension icon in your Chrome toolbar
2. **Enter Your Message**: Paste or type your message in the input textarea
3. **Select Recipient**: Choose the recipient's country from the dropdown
4. **Adjust Parameters**: Use the sliders to fine-tune communication style
5. **Analyze & Calibrate**: Click "Analyze & Calibrate" to process your message
6. **Review Results**: 
   - View the calibrated version in the output section
   - Check the Cultural Reception Radar for visual feedback
   - Read the Intent & Rationale analysis
   - Review the Audience Inner Monologue simulation
7. **Copy & Use**: Copy the calibrated version to use in your communication

### Context Menu Integration

- Right-click on selected text anywhere on the web
- Choose "Analyze with PrismText" from the context menu
- The selected text will be analyzed automatically

### Settings

Access advanced settings via:
- **Identity Consistency**: Maintain consistent communication style across messages
- **API Settings**: Manage your Gemini API key and preferences

## Supported Countries

PrismText supports calibration for the following countries:

- **Western Europe**: Germany (de), France (fr)
- **Northern Europe**: United Kingdom (uk), Sweden (se)
- **East Asia**: Japan (jp), Korea (kr), China (cn)
- **North America**: United States (us)
- **South America**: Brazil (br)
- **Central America**: Mexico (mx)
- **South Asia**: India (in)
- **Oceania**: Australia (au)

## Technical Architecture

### Project Structure

```
PrismText/
├── manifest.json              # Chrome extension manifest
├── package.json               # Node.js dependencies
├── src/
│   ├── background/
│   │   └── background.js      # Service worker for API calls
│   ├── content/
│   │   └── content.js         # Content script for page interaction
│   ├── popup/
│   │   ├── popup.html         # Main UI
│   │   ├── popup.js           # Popup logic
│   │   ├── popup.css          # Styles
│   │   ├── options.html       # Settings page
│   │   ├── options.js         # Settings logic
│   │   ├── identity.html      # Identity consistency page
│   │   └── identity.js        # Identity logic
│   └── lib/                   # Analysis modules
│       ├── gemini-client.js   # Gemini API client
│       ├── intent-detector-v2.js
│       ├── cultural-analyzer-v2.js
│       ├── tone-calibrator-v2.js
│       ├── contextual-intelligence.js
│       ├── semantic-analyzer-v3.js
│       ├── entity-recognizer-v3.js
│       ├── language-detector-v3.js
│       ├── sentiment-analyzer-v3.js
│       └── [additional modules...]
└── icons/                     # Extension icons
```

### Key Technologies

- **Chrome Extension Manifest V3**: Modern extension architecture
- **Google Gemini 3 API**: AI-powered text analysis and calibration
- **Vanilla JavaScript**: No framework dependencies for lightweight performance
- **Fetch API**: CSP-compliant HTTP requests

### API Integration

PrismText uses the Google Gemini REST API directly via `fetch()`, ensuring:
- Content Security Policy (CSP) compliance
- No external SDK dependencies
- Full control over API calls
- Efficient error handling and fallbacks

## Development

### Scripts

```bash
# Development (load extension manually)
npm run dev

# Build (ready for production)
npm run build
```

### Dependencies

- `@google/genai`: ^1.40.0
- `@google/generative-ai`: ^0.3.0

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Privacy & Security

- **Local Storage**: API keys and preferences are stored locally in Chrome's storage
- **No Data Collection**: PrismText does not collect or transmit user data
- **API Calls**: All API calls go directly to Google's Gemini API
- **No Tracking**: No analytics or tracking scripts included

## Limitations

- Requires an active internet connection for Gemini API calls
- API rate limits apply based on your Google Cloud quota
- Some features require a valid Gemini API key

## Troubleshooting

### API Key Issues

- Ensure your API key is valid and has not expired
- Check that you have enabled the Gemini API in Google Cloud Console
- Verify your API key has sufficient quota

### Extension Not Working

- Reload the extension in `chrome://extensions/`
- Check the browser console for errors (F12)
- Ensure all permissions are granted

### Calibration Not Updating

- Check your internet connection
- Verify API key is correctly configured
- Try refreshing the popup window

## License

MIT License - see LICENSE file for details

## Credits

Developed by the PrismText Team

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Note**: PrismText is powered by Google's Gemini 3 AI. Ensure you comply with Google's API terms of service when using this extension.
