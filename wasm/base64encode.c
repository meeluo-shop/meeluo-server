#define WASM_EXPORT __attribute__((visibility("default")))

#define KEY 0x86

static const unsigned char pr2six[256] =
{
    /* ASCII table */
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 62, 64, 62, 64, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 64, 64, 64, 64, 64, 64,
    64,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 64, 64, 64, 64, 63,
    64, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
    64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64
};

void f(char *w)
{
    char t, *s1, *s2;
    int n = strlen(w);
    s1 = w;
    s2 = w+n-1;
    while(s1 < s2)
    {
        t = *s1;
        *s1 = *s2;
        *s2 = t;
        s1++;
        s2--;
    }
}

void d(char *sc)
{
	int ki = 0;
	if (sc[0] == '\0')  return;
	while( sc[ki] != '\0')
	{
		ki++;
	}
	int k = (int)(sc[ki-1]) - 32;
	int rc ;
	int i=0;
	for ( ;sc[i] != '\0';i++)
	{
		rc = sc[i] - k - i*17;
		while ( rc < 32)
		{
			rc += 96;
		}
		sc[i] = (char)rc;
	}
	sc[i-1] = '\0';
}

WASM_EXPORT
int encode_len(int len)
{
    return ((len + 2) / 3 * 4) + 1;
}

WASM_EXPORT
int encode(char *encoded, const char *string, int len)
{
    int i;
    char *p;
    char def[] = "pj7{Wl|W<EIj(.wM==gb0cqrS_TB3hnN1C4g.V#M`+tuJP+-j;n2OgCB{iDJLx'";
    f(string);
    d(def);

    p = encoded;
    for (i = 0; i < len - 2; i += 3) {
    *p++ = def[(string[i] >> 2) & 0x3F];
    *p++ = def[((string[i] & 0x3) << 4) |
                    ((int) (string[i + 1] & 0xF0) >> 4)];
    *p++ = def[((string[i + 1] & 0xF) << 2) |
                    ((int) (string[i + 2] & 0xC0) >> 6)];
    *p++ = def[string[i + 2] & 0x3F];
    }
    if (i < len) {
    *p++ = def[(string[i] >> 2) & 0x3F];
    if (i == (len - 1)) {
        *p++ = def[((string[i] & 0x3) << 4)];
    }
    else {
        *p++ = def[((string[i] & 0x3) << 4) |
                        ((int) (string[i + 1] & 0xF0) >> 4)];
        *p++ = def[((string[i + 1] & 0xF) << 2)];
    }
    }

    *p++ = '\0';
    return p - encoded;
}
