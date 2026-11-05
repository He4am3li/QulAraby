# Saudi tutors, natural standing poses and conversation attention

Salman stands on the right with his body turned inward toward Sara. Sara stands on the left with her body turned inward toward Salman. Both retain frontal heads for student attention, asymmetric relaxed arms and weight distribution, full hands and shoes, and their established clothing and identities. Their full-body viewport matches the Egyptian pair's camera scale and foot plane.

The original approved Salman layered source and Sara v1 artwork remain available. The new face-only manifests register authored eyes, eyelids, brows and mouth shapes to the edited source portraits. The renderer paints the new full-body source once, followed by the requested facial expression. It never paints the old body parts over the new pose.

The partner's speech changes attention only. The active tutor's own output-audio clock drives lips and subtle brow emphasis. Gaze turns take place under a blink. Listening faces the student or the speaking partner as appropriate.

Sara's lips remain visible below her unchanged silver metal face covering. The mouth compositor excludes the covering, and the three covering parts are painted last. Neither gaze nor speech moves the covering.

The Saudi stage uses a fixed physical order in Arabic and English. Other country stages retain their existing placement. Sources, manifests and sprite URLs are versioned together to prevent stale facial coordinates.

To register the edited sources again:

```sh
node scripts/register-saudi-stance.cjs SALMAN_EDIT.png SARA_EDIT.png
```

Validation includes source hashes, PNG geometry, identity and covering contracts, clipped eye movement, safe turn-taking and browser review of both languages at desktop and mobile sizes. The body edits are illustrations with layered facial animation, not a mesh-based body rig.
