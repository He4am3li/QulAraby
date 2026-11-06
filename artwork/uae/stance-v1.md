# Zayed and Maitha, UAE tutor pair

The approved original portraits in `public/avatars/original-rigs/uae` remain intact. Versioned inward-facing body artwork preserves Zayed's grey kandura and Maitha's embroidered dress, jewelry and gold burqa. Both use the shared 824 × 1536 full-body camera and the same foot plane. Zayed remains on the right and Maitha on the left in Arabic and English.

Nine AI-authored facial expressions per actor were registered to the body sources. The registration script crops independent eyes, eyebrows and mouth shapes; it never redraws the full body from the expression atlas. Maitha's source metal is drawn last and excluded from mouth blending. Mouth FV currently uses the E approximation, as in the existing tutor rigs.

`EmiratiLayeredAvatar` uses the existing output-audio lip clock, owns its blink loop, and shares speaker-aware attention rules with the Egyptian/Saudi tutors. Only the active speaker reads the lip clock. Listeners face the partner, both face the student on student turns, and gaze changes occur under a blink. Reduced-motion and loading fallback show the new static body source.

Generated reference prompts: preserve exact original identity and costume, inward body rotation 18 degrees, front-facing head, natural asymmetric relaxed arms, complete feet, transparent background. Facial atlas: neutral, blink, left/right gaze, welcoming smile, thinking, A/E/O speaking shapes, fixed head registration and unchanged costume.
